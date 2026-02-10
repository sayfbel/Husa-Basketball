
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { users } from '../../data/users';
import './Login.css';

// Default silhouette (SVG Base64) to avoid network errors
const DEFAULT_AVATAR = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0iIzMzMyI+PHBhdGggZD0iTTEyIDEyYzIuMjEgMCA0LTEuNzkgNC00cy0xLjc5LTQtNC00LTQgMS43OS00IDQgMS43OSA0IDQgNHzmMCAyYy0yLjY3IDAtOCAxLjM0LTggNHYyaDE2di0yYzAtMi42Ni01LjMzLTQtOC00eiIvPjwvc3ZnPg==";

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [matchedUser, setMatchedUser] = useState(null);

    // Effect to check if name matches a known user
    useEffect(() => {
        if (!name) {
            setMatchedUser(null);
            return;
        }
        // Case-insensitive match for partial or full name
        const found = users.find(u => u.name.toLowerCase() === name.toLowerCase());
        setMatchedUser(found || null);
    }, [name]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const success = await login(name, code);
        if (success) {
            // Get user from local storage or context (awkward because state update is async)
            // But we know 'success' is only true if stored.
            // Let's refactor 'login' to return the user object or role, 
            // OR simply read from the updated lookup we just did.

            // Re-find the user to get the role for redirect
            const foundUser = users.find(u => u.name.toLowerCase() === name.toLowerCase());

            if (foundUser) {
                switch (foundUser.role) {
                    case 'Player':
                        navigate('/dashboard/player');
                        break;
                    case 'Coach':
                        navigate('/dashboard/coach');
                        break;
                    case 'President':
                        navigate('/dashboard/president');
                        break;
                    default:
                        navigate('/dashboard/player'); // Fallback
                }
            } else {
                navigate('/'); // Safety fallback
            }
        } else {
            setError('Invalid credentials. Please check your Name and Code.');
        }
    };

    return (
        <div className="login-container">
            <div className="login-card animate-fade-in">
                {/* User Image Circle */}
                <div className="user-avatar-circle">
                    <img
                        src={matchedUser ? matchedUser.image : DEFAULT_AVATAR}
                        alt="User Avatar"
                        className={matchedUser ? "avatar-img active" : "avatar-img"}
                    />
                </div>

                <h2>Dashboard</h2>
                <p>Login to your account</p>
                {error && <div className="error-message">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Name And Family Name"
                            required
                            autoComplete="username"
                        />
                    </div>
                    <div className="form-group">
                        <label>Code</label>
                        <input
                            type="password"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="Enter your access code"
                            required
                            autoComplete="current-password"
                        />
                    </div>
                    <button type="submit" className="btn-login">Login</button>
                </form>
            </div>
        </div>
    );
};

export default Login;
