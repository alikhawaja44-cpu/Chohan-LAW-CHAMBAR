import React, { useState, useEffect, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  Scale, Gavel, Users, Calendar, FileText, DollarSign, 
  Plus, Search, X, Check, Clock, ChevronRight, Briefcase, 
  MapPin, Phone, Mail, Printer, Shield, LayoutGrid, Trash2, LogIn, Lock
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, deleteDoc, doc, updateDoc, onSnapshot, query, orderBy, setDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// --- FIREBASE CONFIG ---
const firebaseConfig = {
    apiKey: "AIzaSyAOFOgjdbdoUYBTldXOEEG636q1EM8EBfc",
    authDomain: "leanaxis-accounts.firebaseapp.com",
    projectId: "leanaxis-accounts",
    storageBucket: "leanaxis-accounts.firebasestorage.app",
    messagingSenderId: "855221056961",
    appId: "1:855221056961:web:b4129012fa0f56f58a6b40"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// --- HOOKS ---
function useFirebaseSync(collectionName) {
    const [data, setData] = useState([]);
    useEffect(() => {
        const q = query(collection(db, collectionName), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
    }, [collectionName]);
    return data;
}

// --- LOGIN COMPONENT ---
const Login = ({ onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        // Simple hardcoded auth for now (can be expanded to Firebase Auth later)
        if (username === 'admin' && password === 'law123') {
            onLogin();
        } else {
            setError('Invalid Credentials');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4 font-sans">
            <div className="bg-white w-full max-w-md p-8 rounded-xl shadow-2xl border-t-4 border-gold-500">
                <div className="text-center mb-8">
                    <Scale className="mx-auto text-navy-900 mb-4" size={48} />
                    <h1 className="font-serif text-2xl font-bold text-navy-900 tracking-wider">CHOHAN LAW CHAMBER</h1>
                    <p className="text-slate-500 text-sm mt-2">Authorized Personnel Only</p>
                </div>
                
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-navy-900 mb-1">Username</label>
                        <input 
                            type="text" 
                            className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:border-gold-500"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            placeholder="admin"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-navy-900 mb-1">Password</label>
                        <input 
                            type="password" 
                            className="w-full border border-slate-300 rounded-lg p-3 outline-none focus:border-gold-500"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            placeholder="••••••"
                        />
                    </div>
                    
                    {error && <p className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">{error}</p>}
                    
                    <button type="submit" className="w-full bg-navy-900 text-white font-bold py-3 rounded-lg hover:bg-navy-800 transition-colors shadow-lg flex items-center justify-center gap-2">
                        <LogIn size={20} /> Secure Login
                    </button>
                </form>
                <div className="mt-6 text-center text-xs text-slate-400">
                    &copy; 2026 Chohan Law Chamber. Confidential.
                </div>
            </div>
        </div>
    );
};

// --- APP COMPONENT ---
function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [view, setView] = useState('dashboard');
    const [showModal, setShowModal] = useState(false);
    
    // Data
    const cases = useFirebaseSync('chohan_cases');
    const clients = useFirebaseSync('chohan_clients');
    const hearings = useFirebaseSync('chohan_hearings');
    const invoices = useFirebaseSync('chohan_invoices');

    // Forms
    const [formData, setFormData] = useState({});

    // --- CALCULATIONS ---
    const stats = useMemo(() => {
        const activeCases = cases.filter(c => c.status === 'Open').length;
        const totalClients = clients.length;
        const pendingRevenue = invoices.reduce((acc, inv) => acc + (Number(inv.amount) - Number(inv.paid || 0)), 0);
        const upcomingHearings = hearings.filter(h => new Date(h.date) >= new Date()).length;
        return { activeCases, totalClients, pendingRevenue, upcomingHearings };
    }, [cases, clients, invoices, hearings]);

    // --- HANDLERS ---
    const handleSave = async (e) => {
        e.preventDefault();
        const collectionMap = {
            'cases': 'chohan_cases',
            'clients': 'chohan_clients',
            'calendar': 'chohan_hearings',
            'billing': 'chohan_invoices'
        };
        
        await addDoc(collection(db, collectionMap[view]), {
            ...formData,
            createdAt: new Date().toISOString(),
            status: formData.status || 'Open'
        });
        
        setShowModal(false);
        setFormData({});
        alert("Record Saved Successfully!");
    };

    const deleteRecord = async (collectionName, id) => {
        if(confirm("Are you sure?")) await deleteDoc(doc(db, collectionName, id));
    };

    // --- UI COMPONENTS ---
    const StatCard = ({ icon: Icon, label, value, color }) => (
        <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 flex items-center justify-between" style={{ borderColor: color }}>
            <div>
                <p className="text-sm font-bold text-slate-500 uppercase">{label}</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-1">{value}</h3>
            </div>
            <div className="p-3 rounded-full bg-slate-50" style={{ color: color }}>
                <Icon size={28} />
            </div>
        </div>
    );

    if (!isAuthenticated) return <Login onLogin={() => setIsAuthenticated(true)} />;

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
            {/* SIDEBAR */}
            <aside className="w-64 bg-navy-900 text-white flex flex-col shadow-2xl">
                <div className="p-8 border-b border-navy-800">
                    <div className="flex items-center gap-3">
                        <Scale className="text-gold-500" size={32} />
                        <div>
                            <h1 className="font-serif text-xl font-bold tracking-wider text-gold-400">CHOHAN</h1>
                            <p className="text-xs text-slate-400 tracking-widest uppercase">Law Chamber</p>
                        </div>
                    </div>
                </div>
                
                <nav className="flex-1 p-4 space-y-2">
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
                        { id: 'cases', label: 'Case Files', icon: Gavel },
                        { id: 'clients', label: 'Clients', icon: Users },
                        { id: 'calendar', label: 'Court Diary', icon: Calendar },
                        { id: 'billing', label: 'Accounts', icon: DollarSign },
                    ].map(item => (
                        <button 
                            key={item.id}
                            onClick={() => setView(item.id)}
                            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-lg transition-all ${view === item.id ? 'bg-gold-500 text-navy-900 font-bold shadow-lg' : 'text-slate-300 hover:bg-navy-800 hover:text-white'}`}
                        >
                            <item.icon size={20} />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="p-6 border-t border-navy-800">
                    <button onClick={() => setIsAuthenticated(false)} className="flex items-center gap-3 text-slate-400 hover:text-white transition-colors w-full">
                        <Lock size={18} /> Logout
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 overflow-y-auto p-8">
                
                {/* HEADER */}
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h2 className="text-3xl font-bold font-serif text-navy-900 capitalize">{view}</h2>
                        <p className="text-slate-500">Welcome to your digital chamber.</p>
                    </div>
                    {view !== 'dashboard' && (
                        <button onClick={() => setShowModal(true)} className="bg-navy-900 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-navy-800 transition-all flex items-center gap-2">
                            <Plus size={20} /> Add New
                        </button>
                    )}
                </header>

                {/* DASHBOARD VIEW */}
                {view === 'dashboard' && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <StatCard icon={Gavel} label="Active Cases" value={stats.activeCases} color="#D97706" />
                            <StatCard icon={Calendar} label="Next Hearings" value={stats.upcomingHearings} color="#DC2626" />
                            <StatCard icon={Users} label="Total Clients" value={stats.totalClients} color="#2563EB" />
                            <StatCard icon={DollarSign} label="Pending Fees" value={`Rs ${stats.pendingRevenue.toLocaleString()}`} color="#059669" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* RECENT HEARINGS */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                <h3 className="font-bold text-lg text-navy-900 mb-4 flex items-center gap-2"><Clock size={20} className="text-gold-500"/> Upcoming Hearings</h3>
                                <div className="space-y-4">
                                    {hearings.slice(0, 5).map(h => (
                                        <div key={h.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors border-l-4 border-navy-900">
                                            <div className="bg-slate-100 px-3 py-2 rounded text-center min-w-[60px]">
                                                <span className="block text-xs font-bold text-slate-500 uppercase">{new Date(h.date).toLocaleString('default', { month: 'short' })}</span>
                                                <span className="block text-xl font-bold text-navy-900">{new Date(h.date).getDate()}</span>
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-bold text-slate-800">{h.caseTitle}</h4>
                                                <p className="text-sm text-slate-500">{h.court} • {h.time}</p>
                                            </div>
                                            <span className="bg-gold-100 text-gold-700 px-3 py-1 rounded-full text-xs font-bold">{h.type}</span>
                                        </div>
                                    ))}
                                    {hearings.length === 0 && <p className="text-slate-400 text-center py-4">No upcoming hearings scheduled.</p>}
                                </div>
                            </div>

                            {/* CASE DISTRIBUTION */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                                <h3 className="font-bold text-lg text-navy-900 mb-4 flex items-center gap-2"><Briefcase size={20} className="text-gold-500"/> Case Status</h3>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={[
                                            { name: 'Open', value: cases.filter(c => c.status === 'Open').length },
                                            { name: 'Closed', value: cases.filter(c => c.status === 'Closed').length },
                                            { name: 'Appeal', value: cases.filter(c => c.status === 'Appeal').length },
                                            { name: 'Pending', value: cases.filter(c => c.status === 'Pending').length },
                                        ]}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" />
                                            <YAxis />
                                            <Tooltip cursor={{fill: 'transparent'}} />
                                            <Bar dataKey="value" fill="#1e3a8a" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* CASES VIEW */}
                {view === 'cases' && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-navy-900 text-white text-sm uppercase tracking-wider">
                                <tr>
                                    <th className="p-4">Case No.</th>
                                    <th className="p-4">Title / Parties</th>
                                    <th className="p-4">Court & Judge</th>
                                    <th className="p-4">Next Hearing</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {cases.map(c => (
                                    <tr key={c.id} className="hover:bg-slate-50">
                                        <td className="p-4 font-mono font-bold text-gold-600">{c.caseNo}</td>
                                        <td className="p-4 font-bold text-slate-800">{c.title}</td>
                                        <td className="p-4 text-sm text-slate-600">{c.court}<br/><span className="text-xs text-slate-400">{c.judge}</span></td>
                                        <td className="p-4 text-sm font-bold text-navy-800">{c.nextDate || 'Not Set'}</td>
                                        <td className="p-4"><span className={`px-3 py-1 rounded-full text-xs font-bold ${c.status === 'Open' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>{c.status}</span></td>
                                        <td className="p-4 text-center">
                                            <button onClick={() => deleteRecord('chohan_cases', c.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={18}/></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* MODAL */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-lg rounded-2xl p-8 shadow-2xl animate-in fade-in zoom-in duration-200">
                            <div className="flex justify-between items-center mb-6 border-b pb-4">
                                <h3 className="text-2xl font-serif font-bold text-navy-900">Add New {view.slice(0, -1)}</h3>
                                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-red-500"><X size={24}/></button>
                            </div>
                            
                            <form onSubmit={handleSave} className="space-y-4">
                                {view === 'cases' && (
                                    <>
                                        <input required placeholder="Case Title (e.g. State vs Ali)" className="w-full border p-3 rounded-lg" onChange={e => setFormData({...formData, title: e.target.value})} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <input required placeholder="Case No." className="w-full border p-3 rounded-lg" onChange={e => setFormData({...formData, caseNo: e.target.value})} />
                                            <input placeholder="Court Name" className="w-full border p-3 rounded-lg" onChange={e => setFormData({...formData, court: e.target.value})} />
                                        </div>
                                        <input placeholder="Judge Name" className="w-full border p-3 rounded-lg" onChange={e => setFormData({...formData, judge: e.target.value})} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <input type="date" className="w-full border p-3 rounded-lg" onChange={e => setFormData({...formData, nextDate: e.target.value})} />
                                            <select className="w-full border p-3 rounded-lg" onChange={e => setFormData({...formData, status: e.target.value})}>
                                                <option>Open</option><option>Closed</option><option>Appeal</option><option>Pending</option>
                                            </select>
                                        </div>
                                    </>
                                )}

                                {view === 'clients' && (
                                    <>
                                        <input required placeholder="Full Name" className="w-full border p-3 rounded-lg" onChange={e => setFormData({...formData, name: e.target.value})} />
                                        <input placeholder="Mobile Number" className="w-full border p-3 rounded-lg" onChange={e => setFormData({...formData, mobile: e.target.value})} />
                                        <input placeholder="CNIC / ID" className="w-full border p-3 rounded-lg" onChange={e => setFormData({...formData, cnic: e.target.value})} />
                                        <textarea placeholder="Address / Notes" className="w-full border p-3 rounded-lg" rows="3" onChange={e => setFormData({...formData, address: e.target.value})}></textarea>
                                    </>
                                )}

                                {view === 'calendar' && (
                                    <>
                                        <input required placeholder="Case Title" className="w-full border p-3 rounded-lg" onChange={e => setFormData({...formData, caseTitle: e.target.value})} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <input required type="date" className="w-full border p-3 rounded-lg" onChange={e => setFormData({...formData, date: e.target.value})} />
                                            <input type="time" className="w-full border p-3 rounded-lg" onChange={e => setFormData({...formData, time: e.target.value})} />
                                        </div>
                                        <select className="w-full border p-3 rounded-lg" onChange={e => setFormData({...formData, type: e.target.value})}>
                                            <option>Hearing</option><option>Evidence</option><option>Arguments</option><option>Judgment</option>
                                        </select>
                                    </>
                                )}

                                {view === 'billing' && (
                                    <>
                                        <input required placeholder="Client / Case Name" className="w-full border p-3 rounded-lg" onChange={e => setFormData({...formData, client: e.target.value})} />
                                        <div className="grid grid-cols-2 gap-4">
                                            <input required type="number" placeholder="Total Fees" className="w-full border p-3 rounded-lg" onChange={e => setFormData({...formData, amount: e.target.value})} />
                                            <input type="number" placeholder="Amount Paid" className="w-full border p-3 rounded-lg" onChange={e => setFormData({...formData, paid: e.target.value})} />
                                        </div>
                                        <input type="date" className="w-full border p-3 rounded-lg" onChange={e => setFormData({...formData, date: e.target.value})} />
                                    </>
                                )}

                                <button type="submit" className="w-full bg-navy-900 text-white font-bold py-3 rounded-xl hover:bg-navy-800 transition-colors shadow-lg mt-4">
                                    Save Record
                                </button>
                            </form>
                        </div>
                    </div>
                )}

            </main>
        </div>
    );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);