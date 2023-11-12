// remove item from cart
function remove_item(item_id) {
    if(confirm("Are you sure you want to take out this item")) {
        window.location.href = `/remove_item?id=${item_id}`;
    }    
}

// calculate total in cart in case item is increased

   