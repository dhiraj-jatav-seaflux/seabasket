export function finalDiscountPrice(price:number, discount:number){
    return price - (price * discount) / 100;
}