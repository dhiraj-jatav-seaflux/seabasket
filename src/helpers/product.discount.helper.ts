export function finalPrice(price:number, discount:number){
    return price - (price * discount) / 100;
}