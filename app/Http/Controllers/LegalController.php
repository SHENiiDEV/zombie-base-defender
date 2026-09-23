<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LegalController extends Controller
{
    public function terms(Request $request): Response
    {
        return $this->renderDocument($request, 'Legal/Terms');
    }

    public function privacy(Request $request): Response
    {
        return $this->renderDocument($request, 'Legal/Privacy');
    }

    public function cookies(Request $request): Response
    {
        return $this->renderDocument($request, 'Legal/Cookies');
    }

    protected function renderDocument(Request $request, string $component): Response
    {
        return Inertia::render($component, [
            'is_authenticated' => $request->user() !== null,
            'company' => [
                'name' => config('company.name'),
                'number' => config('company.number'),
                'address' => config('company.address'),
                'email' => config('company.email'),
            ],
            'cookie_details' => [
                'session_name' => config('session.cookie'),
                'lifetime_minutes' => (int) config('session.lifetime'),
                'expire_on_close' => (bool) config('session.expire_on_close'),
            ],
        ]);
    }
}
