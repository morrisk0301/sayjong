sortWithIsHot = function(a, b){
    if(a.is_hot < b.is_hot)
        return -1;
    if(a.is_hot > b.is_hot)
        return 1;
    return 0;
};

sortWithCreatedAt = function(a, b){
    if(a.created_at > b.created_at)
        return -1;
    if(a.created_at < b.created_at)
        return 1;
    return 0;
};

sortWithCategoryCounter = function(a, b){
    if(a.category_counter > b.category_counter)
        return -1;
    if(a.category_counter < b.category_counter)
        return 1;
    return 0;
};

sortWithCategoryHot = function(a, b){
    if(a.category_hot < b.category_hot)
        return -1;
    if(a.category_hot > b.category_hot)
        return 1;
    return 0;
};

sortWithCurrentCount = function(a, b){
    if(a.current_count > b.current_count)
        return -1;
    if(a.current_count < b.current_count)
        return 1;
    return 0;
};

module.exports = {sortWithIsHot, sortWithCreatedAt, sortWithCategoryCounter, sortWithCurrentCount, sortWithCategoryHot};