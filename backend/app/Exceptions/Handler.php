<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    /**
     * Render an exception into an HTTP response.
     */
    public function render($request, Throwable $e)
    {
        // تخصيص استجابة API للاستثناءات
        if ($request->is('api/*')) {
            return $this->handleApiException($request, $e);
        }

        return parent::render($request, $e);
    }

    /**
     * Handle API exceptions with consistent JSON response format
     */
    private function handleApiException(Request $request, Throwable $e): JsonResponse
    {
        $statusCode = 500;
        $message = 'Internal Server Error';

        if ($e instanceof ValidationException) {
            $statusCode = 422;
            $message = 'Validation Error';
            
            return response()->json([
                'success' => false,
                'message' => $message,
                'errors' => $e->validator->errors()
            ], $statusCode);
        }

        if ($e instanceof NotFoundHttpException) {
            $statusCode = 404;
            $message = 'Resource Not Found';
        }

        // في حالة التطوير، أظهر تفاصيل الخطأ
        $response = [
            'success' => false,
            'message' => $message,
        ];

        if (config('app.debug')) {
            $response['debug'] = [
                'exception' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
            ];
        }

        return response()->json($response, $statusCode);
    }
}