const API_URL =`${import.meta.env.VITE_API_URL}/auth`;

export const authLogin = async(email, password)=>{
    const res =await fetch(`${API_URL}/login`, {
        method:"POST",
        headers:{
            "content-type":"application/json"
        },
        body:JSON.stringify({email, password})
    })
    const data = await res.json();
  if (!data.success) throw new Error(data.message);
  
  // Store token and user info
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data.user;
};

export const authSignup = async (userData) => {
  const response = await fetch(`${API_URL}/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.message);
  
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data.user;
};

export const authLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};