<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('surname')->nullable()->after('name');
            $table->string('phone')->nullable()->after('email');
            $table->date('date_of_birth')->nullable()->after('phone');
            $table->string('address_line1')->nullable()->after('date_of_birth');
            $table->string('city')->nullable()->after('address_line1');
            $table->string('country')->nullable()->after('city');
            $table->string('postal_code')->nullable()->after('country');
            $table->timestamp('terms_accepted_at')->nullable()->after('postal_code');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'surname',
                'phone',
                'date_of_birth',
                'address_line1',
                'city',
                'country',
                'postal_code',
                'terms_accepted_at',
            ]);
        });
    }
};
