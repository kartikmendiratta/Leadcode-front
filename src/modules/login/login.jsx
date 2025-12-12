import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const Login = () => {
    const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
                <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <div className="text-xl font-light animate-pulse">Loading...</div>
            </div>
        );
    }

    if (isAuthenticated) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-4 text-center">
                <div className="text-6xl mb-6 text-green-500">✓</div>
                <div className="text-2xl font-bold mb-2">Successfully logged in!</div>
                <div className="text-gray-400">Redirecting to your dashboard...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-black relative overflow-hidden p-5 font-sans">
            {/* Background Gradients */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-3/4 left-1/2 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
            </div>

            {/* Scrolling Code Background Effect (Simplified) */}
            <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden">
                <div className="animate-[codeScroll_20s_linear_infinite] text-blue-400 font-mono text-sm leading-loose whitespace-pre-wrap p-4">
                    {`function() { return "Leadcode"; }
const coding = true;
let success = false;
if (coding) { success = true; }
console.log("Welcome!");
import React from "react";
const [state, setState] = useState();
export default App;
git commit -m "new feature"
npm install react
docker run -d app
SELECT * FROM users;
while(true) { code(); }
async function fetchData() {}
`.repeat(10)}
                </div>
            </div>

            {/* Floating Code Particles */}
            <div className="absolute top-[10%] left-[10%] text-orange-500/60 font-mono text-sm animate-bounce delay-100 hidden md:block">{'{ coding: true }'}</div>
            <div className="absolute top-[20%] right-[10%] text-blue-500/60 font-mono text-sm animate-bounce delay-300 hidden md:block">{'const app = () => {}'}</div>
            <div className="absolute bottom-[15%] left-[15%] text-purple-500/60 font-mono text-sm animate-bounce delay-500 hidden md:block">{'git push origin main'}</div>
            <div className="absolute bottom-[25%] right-[20%] text-green-500/60 font-mono text-sm animate-bounce delay-700 hidden md:block">{'npm start'}</div>
            
            <div className="relative z-10 bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-8 md:p-12 w-full max-w-md shadow-2xl text-center">
                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">Leadcode</h1>
                    <p className="text-lg text-white/90 leading-relaxed">
                        Track your coding journey across LeetCode and GitHub
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-4 mb-8 text-left">
                    <div className="flex items-center text-white/80 text-sm md:text-base bg-white/5 p-3 rounded-lg border border-white/10 transition-colors hover:bg-white/10">
                        <span className="mr-3 text-xl">🏆</span>
                        <span>Compete in coding rooms</span>
                    </div>
                    <div className="flex items-center text-white/80 text-sm md:text-base bg-white/5 p-3 rounded-lg border border-white/10 transition-colors hover:bg-white/10">
                        <span className="mr-3 text-xl">📊</span>
                        <span>Track LeetCode progress</span>
                    </div>
                    <div className="flex items-center text-white/80 text-sm md:text-base bg-white/5 p-3 rounded-lg border border-white/10 transition-colors hover:bg-white/10">
                        <span className="mr-3 text-xl">⚡</span>
                        <span>Monitor GitHub activity</span>
                    </div>
                    <div className="flex items-center text-white/80 text-sm md:text-base bg-white/5 p-3 rounded-lg border border-white/10 transition-colors hover:bg-white/10">
                        <span className="mr-3 text-xl">🎯</span>
                        <span>View detailed leaderboards</span>
                    </div>
                </div>

                <button 
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] cursor-pointer"
                    onClick={() => loginWithRedirect()}
                >
                    Get Started
                </button>
            </div>
            
            <style>{`
                @keyframes codeScroll {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-50%); }
                }
            `}</style>
        </div>
    );
};

export default Login;