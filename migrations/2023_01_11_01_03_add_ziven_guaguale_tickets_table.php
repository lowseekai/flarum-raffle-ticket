<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Schema\Builder;

return [
    'up' => function (Builder $schema) {
        if (!$schema->hasTable('ziven_guaguale_tickets')) {
            $schema->create('ziven_guaguale_tickets', function (Blueprint $table) {
                $table->increments('id');
                $table->integer('gua_id')->unsigned();
                $table->integer('value')->default(0);
                $table->string('flag', 255)->default('');

                $table->index('flag');
                $table->foreign('gua_id')->references('id')->on('ziven_guaguale')->onDelete('cascade');
            });
        }
    },
    'down' => function (Builder $schema) {
        $schema->drop('ziven_guaguale_tickets');
    },
];
