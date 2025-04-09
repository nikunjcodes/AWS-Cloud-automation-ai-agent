// Simple utility to extract token from Authorization header
export const getTokenFromRequest = (request: Request) => {
  return request.headers.get('authorization')?.split(' ')[1];
}; 