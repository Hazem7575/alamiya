<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class ApiResponse
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // تخصيص headers للاستجابة
        $response->headers->set('X-API-Version', '1.0');
        $response->headers->set('X-Powered-By', 'Laravel City Distance API');

        return $response;
    }
}