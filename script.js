async function getJewels() {
    console.log("getting jewels");
    var jewelsHTML = "";
    var response = await fetch("https://final-project-d6267.firebaseio.com/jewels.json", {
        method: "GET",
        body: undefined
    });
    var jewels = await response.json();

    for (id in jewels) {
        var jewel = jewels[id];
        if (jewel != null) {
            jewel.id = id;
            jewelsHTML += buildProduct(jewel);
        }
    }

    document.getElementsByClassName("jewels")[0].innerHTML = jewelsHTML;
}


function buildProduct(jewel) {
    return `    <div class="p-flex">
            <div class="p-flex-in">
            <a href="details.html?id=${jewel.id}"><img class="p-img" src="${jewel.image}" /></a>
            <div class="p-name">${jewel.name}</div>
            <div class="p-price">${jewel.price}</div>
            <button class="p-add"><a href="details.html?id=${jewel.id}">Details </a></button>
            </div>
        </div>`;
}


/*2.details.html*/

function getIdFromQuery() {
    var urlParams = new URLSearchParams(window.location.search);
    var myParam = urlParams.get('id');
    return myParam;
}

async function getJewel() {
    var jewelId = getIdFromQuery();
    console.log("getting jewel id=" + jewelId);
    var jewelsHTML = "";
    var response = await fetch(`https://final-project-d6267.firebaseio.com/jewels/${jewelId}.json`, {
        method: "GET",
        body: undefined
    });
    jewel = await response.json();

    jewelsHTML = buildDetails(jewel);

    document.getElementsByClassName("contentWrapper")[0].innerHTML = jewelsHTML;
}


function buildDetails(jewel) {
    return ` <div class="contentWrapper">
    <div class="left-container">
        <div class="left-content">
        <img class="image" src="${jewel.image}">
        </div>
    </div>
    <div class="right-container">
        <div class="right-content">
            <h4>${jewel.name}</h4>
            <p>${jewel.description}</p>
            <div class="p-price" style="font-size: 14pt; font-weight: bold;">${jewel.price}</div>
            <div class="p-stock">In Stock: ${jewel.quantity}</div>
            <div class="p-qty"><input id="qty" type="number" name="qty" placeholder="1"></input>
            </div>
            <button class="p-add" onClick="addToCart()">Add to Cart</button>
        </div>
    </div>
</div> `;
}

function addToCart() {
    var itemsInCart = JSON.parse(localStorage.getItem("cart"));

    var jewelId = getIdFromQuery();
    var jewelQty = document.getElementById("qty").value || 1;

    var productWasFound = false;

    if (itemsInCart != null) {

        for (var i = 0; i < itemsInCart.length; i++) {
            var item = itemsInCart[i];
            if (item.id == jewelId) {
                item.qty = parseInt(item.qty) + parseInt(jewelQty);
                productWasFound = true;
            }
        }

        if (!productWasFound) {
            var item = { "id": jewelId, "qty": parseInt(jewelQty) }
            itemsInCart.push(item);
        }

    } else {
        itemsInCart = [];
        var item = { "id": jewelId, "qty": parseInt(jewelQty) }
        itemsInCart.push(item);
    }

    localStorage.setItem("cart", JSON.stringify(itemsInCart));

    launch_toast();
}


/*3.shopping cart

 Salvare in local storage localStorage.setItem("lastname", "Smith");
 Aducere din local storage  document.getElementById("result").innerHTML = localStorage.getItem("lastname"); */

async function getJeweById(jewelId) {
    console.log("getting jewel id=" + jewelId);
    var jewelsHTML = "";
    var response = await fetch(`https://final-project-d6267.firebaseio.com/jewels/${jewelId}.json`, {
        method: "GET",
        body: undefined
    });
    jewel = await response.json();
    return jewel;
}

async function drawShoppingCartTable() {
    var itemsInCart = JSON.parse(localStorage.getItem("cart"));
    var cartHtml = "";
    var total = 0;

    for (var i = 0; i < itemsInCart.length; i++) {
        var item = itemsInCart[i];
        var jewel = await getJeweById(item.id);
        if (jewel != null) {
            var subtotal = parseInt(item.qty) * parseInt(jewel.price);
            console.log(item);
            total += subtotal;
            cartHtml += `<tr>
                    <td data-label="Name"><a href="details.html?id=${item.id}">${jewel.name}</a></td>
                    <td data-label="Price">${jewel.price}</td>
                    <td data-label="Quantity"><input type="number" id="qty_${item.id}" onChange= "quantityUpdated(${item.id})" value="${item.qty}"/></td>
                    <td data-label="Subtotal" class="subtotal" id="subtotal_${item.id}">${subtotal}</td>
                    <td data-label="Actions"><input type="button" value="Remove" onClick="removeItemFromCart('${item.id}')"/></td>
                </tr>`;
        }
    }

    cartHtml += `<tr>
            <td data-label="Name"><b>TOTAL</b></td>
            <td data-label="Price"></td>
            <td data-label="Quantity"></td>
            <td data-label="Total" id="total">${total}</td>
            <td data-label="Actions"><div id="btn"><button class="Button"><span>BUY</span></button> </div></td>
        </tr>`;

    document.getElementById("cartTableBody").innerHTML = cartHtml;

}

async function quantityUpdated(id) {
    var qty = parseInt(document.getElementById("qty_" + id).value);

    var jewel = await getJeweById(id);
    if (qty > jewel.quantity) {
        alert("Not enough stock");
        return;
    }

    var itemsInCart = JSON.parse(localStorage.getItem("cart"));
    for (var i = 0; i < itemsInCart.length; i++) {
        var item = itemsInCart[i];
        if (item.id == id) {
            item.qty = parseInt(qty);
        }
    }

    localStorage.setItem("cart", JSON.stringify(itemsInCart));


    document.getElementById("subtotal_" + id).innerHTML = parseInt(jewel.price) * parseInt(qty);
    recalculateTotal()
}

function recalculateTotal() {
    var total = 0;
    var subtotals = document.getElementsByClassName("subtotal");
    for (var i = 0; i < subtotals.length; i++) {
        total += parseInt(subtotals[i].innerText);
    }
    document.getElementById("total").innerHTML = total;
}

function removeItemFromCart(id) {
    var itemsInCart = JSON.parse(localStorage.getItem("cart"));

    var indexToDelete = -1;
    for (var i = 0; i < itemsInCart.length; i++) {
        var item = itemsInCart[i];
        if (item.id == id) {
            indexToDelete = i;
        }
    }

    if (indexToDelete > -1) {
        itemsInCart.splice(indexToDelete, 1);
    }


    localStorage.setItem("cart", JSON.stringify(itemsInCart));

    drawShoppingCartTable();
}


/*4.admin*/

async function getJewelsAdmin() {
    console.log("getting jewels");
    var jewelsHTML = "";
    var response = await fetch("https://final-project-d6267.firebaseio.com/jewels.json", {
        method: "GET",
        body: undefined
    });
    var jewels = await response.json();

    for (id in jewels) {

        var jewel = jewels[id];
        if (jewel != null) {
            jewel.id = id;
            jewelsHTML += drawAdminTable(jewel);
        }
    }

    document.getElementById("tableBody").innerHTML = jewelsHTML;
}

function drawAdminTable(jewel) {
    return `<tr>
                <td data-label="Image"><img class="p-img" src="${jewel.image}" /></td>
                <td data-label="Name"><span onClick="hideTableShowForm('${jewel.id}', 'edit')">${jewel.name}</span></td>
                <td data-label="Price">${jewel.price}</td>
                <td data-label="Quantity">${jewel.quantity}</td>
                <td data-label="Actions"><input type="button" onClick="deleteFromAdminTable('${jewel.id}')" value="Remove"/></td>
            </tr>`;
}

async function hideTableShowForm(jewelId, mode) {
    document.getElementById("jewels-table").style.display = 'none';
    // document.getElementById("addJewelForm").style.display = 'block';
    document.querySelector("#addJewelForm").style.display = 'block';

    if (mode === 'edit') {
        var jewel = await getJeweById(jewelId);

        document.querySelector("#product_image").value = jewel.image;
        document.querySelector("#product_name").value = jewel.name;
        document.querySelector("#product_price").value = jewel.price;
        document.querySelector("#product_description").value = jewel.description;
        document.querySelector("#product_stock").value = jewel.quantity;
        document.querySelector("#product_id").value = jewelId;

    }

    document.querySelector("#product_mode").value = mode;

}

async function hideFormShowTable() {
    document.getElementById("jewels-table").style.display = 'block';
    document.querySelector("#addJewelForm").style.display = 'none';
    getJewelsAdmin();
}

async function submitAddToServer() {
    var jewel = {};
    jewel.image = document.getElementById("product_image").value;
    jewel.name = document.getElementById("product_name").value;
    jewel.price = document.getElementById("product_price").value;
    jewel.description = document.getElementById("product_description").value;
    jewel.quantity = document.getElementById("product_stock").value;

    var mode = document.querySelector("#product_mode").value;


    if (mode === 'edit') {
        var jewelId = document.getElementById("product_id").value;

        var response = await fetch(`https://final-project-d6267.firebaseio.com/jewels/${jewelId}.json`, {
            method: "PUT",
            body: JSON.stringify(jewel)
        });
    } else {
        var response = await fetch(`https://final-project-d6267.firebaseio.com/jewels.json`, {
            method: "POST",
            body: JSON.stringify(jewel)
        });
    }
    hideFormShowTable();

}


async function deleteFromAdminTable(jewelId) {

    var response = await fetch(`https://final-project-d6267.firebaseio.com/jewels/${jewelId}.json`, {
        method: "DELETE",
        body: undefined
    });

    getJewelsAdmin();
}