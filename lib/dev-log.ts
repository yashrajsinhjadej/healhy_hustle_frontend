/**
 * Development logging utility
 * Only logs in development environment to keep production builds clean
 */

export const devLog = {
  log: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(...args)
    }
  },
  
  error: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.error(...args)
    }
  },
  
  warn: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.warn(...args)
    }
  },
  
  info: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.info(...args)
    }
  }
}

export default devLog