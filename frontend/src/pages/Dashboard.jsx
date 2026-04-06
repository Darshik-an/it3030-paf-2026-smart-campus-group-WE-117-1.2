import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const getFirstName = () => {
    if (!user || (!user.name && !user.sub)) return 'Student';
    const nameStr = user.name || user.sub;
    return nameStr.split(' ')[0];
  };
  
  const getInitial = () => {
      const name = getFirstName();
      return name ? name.charAt(0).toUpperCase() : 'S';
  };

  return (
    <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-primary text-white">
            <div className="p-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-accent2 rounded-lg flex items-center justify-center text-primary font-bold text-xl">E</div>
                <span className="text-xl font-bold tracking-tight">EduFlow</span>
            </div>
            
            <nav className="flex-1 px-4 mt-4 space-y-2">
                <a href="#" className="flex items-center gap-3 p-3 rounded-lg active-nav transition-all">
                    <i className="fa-solid fa-house w-5"></i>
                    <span>Dashboard</span>
                </a>
                <a href="#" className="flex items-center gap-3 p-3 rounded-lg nav-item transition-all">
                    <i className="fa-solid fa-book-open w-5"></i>
                    <span>My Courses</span>
                </a>
                <a href="#" className="flex items-center gap-3 p-3 rounded-lg nav-item transition-all">
                    <i className="fa-solid fa-calendar-days w-5"></i>
                    <span>Schedule</span>
                </a>
                <a href="#" className="flex items-center gap-3 p-3 rounded-lg nav-item transition-all">
                    <i className="fa-solid fa-chart-line w-5"></i>
                    <span>Grades</span>
                </a>
                <a href="#" className="flex items-center gap-3 p-3 rounded-lg nav-item transition-all">
                    <i className="fa-solid fa-message w-5"></i>
                    <span>Messages</span>
                </a>
            </nav>

            <div className="p-6">
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 text-white/60 hover:text-white transition-colors text-sm py-4 border-t border-white/10">
                    <i className="fa-solid fa-arrow-right-from-bracket"></i>
                    Logout
                </button>
            </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-[#f8f9fa]">
            <header className="bg-white border-b h-20 flex items-center justify-between px-8 flex-shrink-0 sticky top-0 z-10">
                <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 w-full max-w-sm">
                    <i className="fa-solid fa-magnifying-glass text-gray-400 mr-2"></i>
                    <input type="text" placeholder="Search..." className="bg-transparent border-none outline-none text-sm w-full" />
                </div>

                <div className="flex items-center gap-6">
                    <button className="relative text-gray-400 hover:text-primary transition-colors">
                        <i className="fa-solid fa-bell text-xl"></i>
                        <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">3</span>
                    </button>
                    <div className="flex items-center gap-3 border-l pl-6">
                        <div className="w-10 h-10 rounded-full bg-accent2 border-2 border-white flex items-center justify-center overflow-hidden font-bold text-primary">
                             {user?.picture ? (
                                <img src={user.picture} alt="avatar" className="w-full h-full object-cover" />
                             ) : (
                                getInitial()
                             )}
                        </div>
                    </div>
                </div>
            </header>

            <div className="p-8 space-y-8 text-slate-800">
                {/* Welcome Section */}
                <section className="flex flex-col lg:flex-row gap-6">
                    <div className="flex-1 bg-primary rounded-3xl p-8 text-white relative overflow-hidden flex flex-col justify-center">
                        <div className="relative z-10">
                            <h1 className="text-3xl font-bold mb-2">Welcome back, {getFirstName()}! 👋</h1>
                            <p className="text-blue-100 mb-6 max-w-md">You've completed 75% of your weekly goals. Keep it up and finish your assignments before Friday!</p>
                            <button className="bg-accent2 text-primary px-6 py-2.5 rounded-xl font-bold hover:scale-105 transition-transform">View Progress</button>
                        </div>
                        <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-accent1 opacity-20 rounded-full blur-3xl"></div>
                    </div>
                </section>

                {user?.role === 'ADMIN' && (
                    <div className="bg-accent1/10 border border-accent1/20 rounded-xl p-4 mb-4 text-accent1 font-bold">
                        <i className="fa-solid fa-shield-halved mr-2"></i>
                        Admin Panel Access Granted
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Course Card Mock */}
                    <div className="bg-white rounded-3xl p-6 card-shadow border-l-8 border-accent1">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="text-[10px] font-bold text-accent1 uppercase tracking-widest">Science</span>
                                <h3 className="text-xl font-bold text-primary">Advanced Astrophysics</h3>
                            </div>
                            <div className="bg-accent1/10 p-2 rounded-lg text-accent1">
                                <i className="fa-solid fa-atom"></i>
                            </div>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full mb-4">
                            <div className="bg-accent1 h-full rounded-full w-2/3"></div>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Chapter 4 of 12</span>
                            <span className="font-bold text-primary">65% Complete</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 card-shadow border-l-8 border-secondary">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">History</span>
                                <h3 className="text-xl font-bold text-primary">Modern World History</h3>
                            </div>
                            <div className="bg-secondary/10 p-2 rounded-lg text-secondary">
                                <i className="fa-solid fa-earth-americas"></i>
                            </div>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full mb-4">
                            <div className="bg-secondary h-full rounded-full w-1/3"></div>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Chapter 2 of 8</span>
                            <span className="font-bold text-primary">40% Complete</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
  );
}