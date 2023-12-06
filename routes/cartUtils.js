// total cost passed  to checkout
function calculateTotalCartItem(req) {
    total = 0;
    let item_count = 0;
    const cart = req.session.cart || [];

    for(i = 0; i < cart.length; i++){
        if(cart[i].sale_price){
            total += (cart[i].sale_price * cart[i].quantity);
        }else{
            total += (cart[i].price *  cart[i].quantity);
        }
        item_count += cart[i].quantity;
    }
    req.session.item_count = item_count;
    req.session.total = total;
    return { total, item_count };
};

module.exports = calculateTotalCartItem;
