const config = {
    port: process.env.PORT || 3000,
    defaultTheme: 'classic',
    cache: {
      maxAge: 10,
      staleWhileRevalidate: true
    }
  };
  
  export default config;
  