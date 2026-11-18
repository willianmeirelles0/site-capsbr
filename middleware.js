export const config = { matcher: '/' };

export default function middleware(request) {
  const host = request.headers.get('host') || '';
  if (host === 'catalogo.capsbr.com.br' || host === 'www.catalogo.capsbr.com.br') {
    return Response.rewrite(new URL('/catalogo.html', request.url));
  }
}
