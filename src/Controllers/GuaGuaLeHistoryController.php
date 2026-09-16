<?php

namespace Ziven\GuaGuaLe\Controllers;

use Flarum\Frontend\Document;
use Psr\Http\Message\ServerRequestInterface;

class GuaGuaLeHistoryController{
    public function __invoke(Document $document, ServerRequestInterface $request){
        return $document;
    }
}
