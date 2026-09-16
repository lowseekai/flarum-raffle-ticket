<?php

namespace Ziven\GuaGuaLe\Notification;

use Flarum\User\User;
use Ziven\GuaGuaLe\Model\GuaGuaLePurchase;
use Ziven\GuaGuaLe\Model\GuaGuaLe;
use Flarum\Notification\Blueprint\BlueprintInterface;

class GuaGuaLeBlueprint implements BlueprintInterface{
    public $guagualePurchase;

    public function __construct(GuaGuaLePurchase $guagualePurchase){
        $this->guagualePurchase = $guagualePurchase;
    }

    public function getSubject(){
        return $this->guagualePurchase;
    }

    public function getFromUser(){
        return $this->guagualePurchase->purchasedUser;
    }

    public function getData(){
        return null;
    }
    
    public static function getType(){
        return 'guagualePurchase';
    }

    public static function getSubjectModel(){
        return GuaGuaLePurchase::class;
    }
}
