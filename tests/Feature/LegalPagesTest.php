<?php

namespace Tests\Feature;

use Inertia\Testing\AssertableInertia as Assert;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class LegalPagesTest extends TestCase
{
    /** @return array<string, array{string, string}> */
    public static function documents(): array
    {
        return [
            'terms' => ['/terms', 'Legal/Terms'],
            'privacy' => ['/privacy', 'Legal/Privacy'],
            'cookies' => ['/cookies', 'Legal/Cookies'],
        ];
    }

    #[DataProvider('documents')]
    public function test_public_documents_use_configured_company_details(string $url, string $component): void
    {
        config(['company' => [
            'name' => 'Example Games',
            'number' => '123456',
            'address' => 'Example Street 1',
            'email' => 'legal@example.test',
            'private_key' => 'never-share',
        ]]);

        $this->get($url)->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component($component)
            ->where('is_authenticated', false)
            ->where('company.name', 'Example Games')
            ->where('company.number', '123456')
            ->where('company.address', 'Example Street 1')
            ->where('company.email', 'legal@example.test')
            ->missing('company.private_key')
            ->where('navigation.cookies', '/cookies')
        );

        $this->assertGuest();
    }

    public function test_cookie_document_uses_actual_session_configuration(): void
    {
        config(['session.cookie' => 'outpost_session', 'session.lifetime' => 45, 'session.expire_on_close' => true]);

        $this->get('/cookies')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->component('Legal/Cookies')
            ->where('cookie_details.session_name', 'outpost_session')
            ->where('cookie_details.lifetime_minutes', 45)
            ->where('cookie_details.expire_on_close', true)
        );
    }

    public function test_missing_company_details_are_not_replaced_with_fictional_information(): void
    {
        config(['company' => ['name' => null, 'number' => null, 'address' => null, 'email' => null]]);

        $this->get('/terms')->assertOk()->assertInertia(fn (Assert $page) => $page
            ->where('company.name', null)
            ->where('company.number', null)
            ->where('company.address', null)
            ->where('company.email', null)
        );
    }
}
