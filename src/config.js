const config = {
  port: process.env.PORT || 3000,
  defaultTheme: 'classic',
  color: {
    minContrast: Number(process.env.COLOR_MIN_CONTRAST ?? 4.5)
  },
  cache: {
    maxAge: 10,
    staleWhileRevalidate: true
  }
};
  
export default config;
  