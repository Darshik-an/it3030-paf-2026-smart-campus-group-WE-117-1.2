import React, { useEffect, useId, useRef, useState } from 'react';
import { Camera, CheckCircle2, QrCode, StopCircle } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeSupportedFormats } from 'html5-qrcode';
import { useBooking } from '../context/BookingContext';

const AttendanceScanner = () => {
  const { confirmAttendance, bookingLoading } = useBooking();
  const scannerElementId = useId().replace(/:/g, '_');
  const scannerRef = useRef(null);
  const captureVideoRef = useRef(null);
  const captureCanvasRef = useRef(null);
  const captureStreamRef = useRef(null);
  const isMountedRef = useRef(true);
  const isConfirmingRef = useRef(false);

  const [isScanning, setIsScanning] = useState(false);
  const [manualCode, setManualCode] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [activeCameraLabel, setActiveCameraLabel] = useState('');
  const [availableCameras, setAvailableCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const [lastDetectedCode, setLastDetectedCode] = useState('');
  const [isCaptureMode, setIsCaptureMode] = useState(false);
  const [isCaptureScanning, setIsCaptureScanning] = useState(false);

  const stopCaptureCamera = () => {
    if (captureStreamRef.current) {
      captureStreamRef.current.getTracks().forEach((track) => track.stop());
      captureStreamRef.current = null;
    }

    if (captureVideoRef.current) {
      captureVideoRef.current.srcObject = null;
    }

    if (isMountedRef.current) {
      setIsCaptureMode(false);
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      const currentScanner = scannerRef.current;
      scannerRef.current = null;
      try {
        await currentScanner.stop();
      } catch {
        // Scanner may already be stopped.
      }
      try {
        await currentScanner.clear();
      } catch {
        // Ignore clear errors during teardown.
      }
    }

    if (isMountedRef.current) {
      setIsScanning(false);
      setActiveCameraLabel('');
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      void stopScanner();
      stopCaptureCamera();
    };
  }, []);

  const confirmCode = async (code) => {
    if (isConfirmingRef.current) {
      return;
    }

    if (!code || !code.trim()) {
      setMessage('Please provide a valid attendance code.');
      setMessageType('error');
      return;
    }

    try {
      isConfirmingRef.current = true;
      await confirmAttendance(code.trim());
      setMessage('Attendance confirmed successfully.');
      setMessageType('success');
      setManualCode('');
      stopCaptureCamera();
      await stopScanner();
    } catch (error) {
      setMessage(error.response?.data || 'Failed to confirm attendance.');
      setMessageType('error');
    } finally {
      isConfirmingRef.current = false;
    }
  };

  const startScanner = async () => {
    if (isScanning) {
      return;
    }

    setMessage('');
    setLastDetectedCode('');
    stopCaptureCamera();

    try {
      const cameras = await Html5Qrcode.getCameras();
      if (!cameras || cameras.length === 0) {
        throw new Error('No camera device was found.');
      }

      setAvailableCameras(cameras);

      const preferredCamera =
        cameras.find((camera) => camera.id === selectedCameraId) ||
        cameras.find((camera) => /back|rear|environment/i.test(camera.label || '')) ||
        cameras[0];

      const scanner = new Html5Qrcode(scannerElementId);
      scannerRef.current = scanner;
      setIsScanning(true);
      setActiveCameraLabel(preferredCamera.label || 'Default camera');
      if (!selectedCameraId) {
        setSelectedCameraId(preferredCamera.id);
      }

      await scanner.start(
        preferredCamera.id,
        {
          fps: 10,
          // Derive the scan box from actual preview size to avoid oversized boxes on mobile.
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
            const scanSize = Math.max(140, Math.floor(minEdge * 0.75));
            return { width: scanSize, height: scanSize };
          },
          aspectRatio: 1,
          disableFlip: false,
          formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
        },
        async (decodedText) => {
          setLastDetectedCode(decodedText);
          setMessage('QR detected. Confirming attendance...');
          setMessageType('info');
          await confirmCode(decodedText);
        },
        () => {
          // Ignore per-frame decode errors.
        }
      );
    } catch (error) {
      const scannerErrorMessage = error?.message || 'Could not access camera.';
      setMessage(`${scannerErrorMessage} You can still confirm with manual code input.`);
      setMessageType('error');
      await stopScanner();
    }
  };

  const startCaptureCamera = async () => {
    setMessage('');
    setLastDetectedCode('');
    await stopScanner();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment'
        },
        audio: false
      });

      captureStreamRef.current = stream;
      setIsCaptureMode(true);

      if (captureVideoRef.current) {
        captureVideoRef.current.srcObject = stream;
        await captureVideoRef.current.play();
      }
    } catch (error) {
      const cameraError = error?.message || 'Could not open camera for capture.';
      setMessage(cameraError);
      setMessageType('error');
    }
  };

  const captureAndScan = async () => {
    if (!captureVideoRef.current || !captureCanvasRef.current) {
      return;
    }

    const video = captureVideoRef.current;
    const canvas = captureCanvasRef.current;

    if (!video.videoWidth || !video.videoHeight) {
      setMessage('Camera is not ready yet. Please wait a moment and try again.');
      setMessageType('error');
      return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    if (!context) {
      setMessage('Unable to process captured image.');
      setMessageType('error');
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    setIsCaptureScanning(true);
    setMessage('Processing captured photo...');
    setMessageType('info');
    setLastDetectedCode('');

    let photoScanner = null;
    try {
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.95));
      if (!blob) {
        throw new Error('Could not capture image from camera.');
      }

      const photoFile = new File([blob], 'attendance-capture.jpg', { type: 'image/jpeg' });
      photoScanner = new Html5Qrcode(scannerElementId);
      const decodedText = await photoScanner.scanFile(photoFile, true);
      setLastDetectedCode(decodedText);
      setMessage('QR detected from captured photo. Confirming attendance...');
      setMessageType('info');
      await confirmCode(decodedText);
    } catch (error) {
      const photoError = error?.message || 'Could not decode a QR from the captured photo.';
      setMessage(`${photoError} Capture again with the QR centered and closer.`);
      setMessageType('error');
    } finally {
      if (photoScanner) {
        try {
          await photoScanner.clear();
        } catch {
          // Ignore clear failures after file decoding.
        }
      }
      setIsCaptureScanning(false);
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg md:text-xl font-bold text-slate-900 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-[#003049]" />
            Attendance Scanner
          </h3>
          <p className="text-sm text-slate-600 mt-1">
            Scan the admin QR code for an approved booking to confirm your attendance.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={selectedCameraId}
          onChange={(event) => setSelectedCameraId(event.target.value)}
          disabled={isScanning || isCaptureMode}
          className="rounded-xl border border-slate-300 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-[#003049] focus:ring-2 focus:ring-[#003049]/10 disabled:opacity-60"
        >
          <option value="">Auto-select camera</option>
          {availableCameras.map((camera) => (
            <option key={camera.id} value={camera.id}>
              {camera.label || `Camera ${camera.id}`}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={startScanner}
          disabled={isScanning || bookingLoading || isCaptureScanning}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#003049] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#002338] disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          <Camera className="w-4 h-4" /> Start Camera
        </button>

        <button
          type="button"
          onClick={startCaptureCamera}
          disabled={bookingLoading || isCaptureMode || isCaptureScanning}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F77F00] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#dc7304] disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          <Camera className="w-4 h-4" /> Capture From Camera
        </button>

        <button
          type="button"
          onClick={stopScanner}
          disabled={!isScanning}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-200 px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-300 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          <StopCircle className="w-4 h-4" /> Stop
        </button>
      </div>

      {isCaptureMode && (
        <div className="rounded-xl border border-slate-300 p-3 space-y-3">
          <video
            ref={captureVideoRef}
            className="w-full rounded-lg bg-black"
            playsInline
            muted
            autoPlay
          />
          <canvas ref={captureCanvasRef} className="hidden" />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={captureAndScan}
              disabled={isCaptureScanning}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {isCaptureScanning ? 'Scanning...' : 'Capture & Scan'}
            </button>
            <button
              type="button"
              onClick={stopCaptureCamera}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-200 px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-300 transition"
            >
              Cancel Capture
            </button>
          </div>
        </div>
      )}

      <div
        id={scannerElementId}
        className={`overflow-hidden rounded-xl border ${isScanning ? 'border-[#003049] p-2' : 'border-dashed border-slate-300 p-6'} min-h-[140px]`}
      />

      {!isScanning && !isCaptureMode && (
        <p className="text-sm text-slate-500 text-center">Camera preview appears here after starting the scanner. Keep the QR centered and within a close distance.</p>
      )}

      {isScanning && activeCameraLabel && (
        <p className="text-xs text-slate-500 text-center">Using: {activeCameraLabel}</p>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={manualCode}
          onChange={(event) => setManualCode(event.target.value)}
          placeholder="Or enter attendance code manually"
          className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm text-slate-700 outline-none focus:border-[#003049] focus:ring-2 focus:ring-[#003049]/10"
        />
        <button
          type="button"
          onClick={() => confirmCode(manualCode)}
          disabled={bookingLoading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#F77F00] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#dc7304] disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          <CheckCircle2 className="w-4 h-4" /> Confirm
        </button>
      </div>

      {message && (
        <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
          messageType === 'success'
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            : messageType === 'info'
              ? 'bg-blue-50 text-blue-700 border border-blue-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
        }`}>
          {message}
        </div>
      )}

      {lastDetectedCode && (
        <div className="rounded-xl px-4 py-3 text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200 break-all">
          Last detected QR payload: {lastDetectedCode}
        </div>
      )}
    </section>
  );
};

export default AttendanceScanner;
