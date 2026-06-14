'use server'
import { z } from 'zod'
import { loginFormSchema, signupFormSchema } from './formSchema'
import { cookies, headers } from 'next/headers'
import { simplePOSTrequest } from './commonFetch'

interface LoginResponse {
  access: string,
  refresh: string
}

const baseUrl = process.env.NEXT_PUBLIC_API_URL;

const resolveAppOrigin = () => {
  const headerStore = headers();
  const host = headerStore.get('x-forwarded-host') || headerStore.get('host');
  const protocol = headerStore.get('x-forwarded-proto') || (host?.includes('localhost') ? 'http' : 'https');

  if (host) {
    return `${protocol}://${host}`;
  }

  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  throw new Error('Application URL is not configured');
}

export const loginUser = async (credentials: z.infer<typeof loginFormSchema>) => {
  const cookieStore = cookies();
  cookieStore.delete('token')
  cookieStore.delete('refresh')
  credentials.username = credentials.instu_id + '_' + credentials.username;
  try {
    const origin = resolveAppOrigin();
    const response = await fetch(`${origin}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials)
    })
    if (response.ok && response.status === 200) {
      const data = await response.json();
      cookieStore.set('token', data.access, {
        httpOnly: true, // Prevent JavaScript access
        maxAge: 60 * 15, // Fifteen Minuter
        sameSite: 'strict', // Mitigate CSRF risk
        secure: process.env.NODE_ENV === 'production', // Set Secure flag only in production
      });
      cookieStore.set('refresh', data.refresh, {
        httpOnly: true, // Prevent JavaScript access
        maxAge: 60 * 60 * 9, // Nine Hour
        sameSite: 'strict', // Mitigate CSRF risk
        secure: process.env.NODE_ENV === 'production', // Set Secure flag only in production
      });
      return data;
    } else if (response.status > 201) {
      console.log(response)
      const error = await response.json()
      throw new Error(error.error || error.detail)
    } else {
      throw new Error("Something went wrong!")
    }
  } catch (error) {
    console.error('Error logging in user:', error);
    throw error;
  }
}

export const registerUser = async (credentials: z.infer<typeof signupFormSchema>) => {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value || null;
  if (token) {
    const parsedData = signupFormSchema.safeParse(credentials) !== undefined && signupFormSchema.safeParse(credentials);
    if (parsedData) {
      try {
        const response = await fetch(`${baseUrl}/api/register/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(parsedData.data)
        })
        const data = await response.json()
        return data
      } catch (error) {
        console.error('Error registering user:', error);
        throw error;
      }
    }
  }
  return null;
}

export const gettingUser = async () => {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value || null;
  if (token) {
    try {
      const response = await fetch(`${baseUrl}/api/verify-user/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.ok && response.status === 200) {
        const data = await response.json()
        return data;
      } else {
        cookieStore.delete('token');
        return null;
      }
    } catch (error) {
      console.error('Error getting user:', error);
      cookieStore.delete('token');
      return null;
    }
  }
  return null;
}

export const verifyingUser = async () => {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value || null;
  if (token) {
    try {
      const response = await fetch(`${baseUrl}/api/verify-user/`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
      if (response.ok && response.status === 200) {
        const data = await response.json()
        return data;
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error verifying user:', error);
      return null;
    }
  }
  return null;
}

export const updateUser = async () => {
  const cookieStore = cookies();
  const token = cookieStore.get('refresh')?.value || null;
  if (token) {
    try {
      const response = await fetch(`${baseUrl}/api/token/refresh/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ refresh: token })
      })
      if (response.ok && response.status === 200) {
        const data = await response.json();
        cookieStore.set('token', data.access, {
          httpOnly: true, // Prevent JavaScript access
          maxAge: 60 * 15, // Fifteen Minuter
          sameSite: 'strict', // Mitigate CSRF risk
          secure: process.env.NODE_ENV === 'production', // Set Secure flag only in production
        });
        cookieStore.set('refresh', data.refresh, {
          httpOnly: true, // Prevent JavaScript access
          maxAge: 60 * 60 * 9, // Nine Hour
          sameSite: 'strict', // Mitigate CSRF risk
          secure: process.env.NODE_ENV === 'production', // Set Secure flag only in production
        });
        return data;
      } else {
        cookieStore.delete('token');
        cookieStore.delete('refresh')
        return null;
      }
    } catch (error) {
      console.error('Error updating user:', error);
      cookieStore.delete('token');
      cookieStore.delete('refresh')
      return null;
    }
  }
  return null;
}

export const logOutUser = () => {
  const cookieStore = cookies();
  const token = cookieStore.get('refresh')?.value || null;

  if (token) {
    cookieStore.delete('refresh')
    cookieStore.delete('token')
    return true;
  } else {
    return false;
  }
}

export const createUserStudent = async (student_id: string) => {
  const full_url = `${baseUrl}/api/student-user/`
  try {
    const response = await simplePOSTrequest(full_url, { student_id: student_id })
    return response
  } catch (error) {
    console.error('Error creating user student:', error);
    throw error;
  }
}
