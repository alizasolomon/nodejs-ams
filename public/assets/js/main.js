$(document).ready(function() {

  // get current URL path and assign 'active' class
  var pathname = window.location.pathname;
  $('.nav-custom > li > a[href="' + pathname + '"]').parent().addClass('active');

  $('#tbl_stock').DataTable({
    "columns": [{
      "orderable": false
    }, null, {
      "orderable": false
    }, null, null, {
      "orderable": false
    }]
  });
  $('#tbl_user').DataTable({
    "columns": [{
        "orderable": false
      },
      null,
      null,
      null,
      {
        "orderable": false
      }
    ]
  });
  $('#tbl_inventory').DataTable({
    "columns": [{
        "orderable": false
      },
      null,
      {
        "orderable": false
      },
      {
        "orderable": false
      },
      {
        "orderable": false
      }
    ],
    "searching": false
  });
  $('#tbl_transactions').DataTable({
    "columns": [
      null,
      null,
      null,
      null,
      null,
      null,
      {
        "orderable": false
      }
    ]
  });

  /*Stock JS - Modal*/
  $(".s_openEditStock").click(function() {
    var stock_id = $(this).data('val').assetId;
    var stock_name = $(this).data('val').name;
    var stock_desc = $(this).data('val').description;
    var stock_category = $(this).data('val').category;
    var u = $(this).data('val').u;

    $("#editStock input[name='assetId']").val(stock_id);
    $("#editStock input[name='itemName']").val(stock_name);
    $("#editStock textarea[name='description']").val(stock_desc);
    $("#editStock select[name='category']").val(stock_category);
    $("#editStock input[name='u']").val(u);
    $("#editStock input[name='oldCategory']").val(stock_category);
  });
  $(".s_openAddQuantity").click(function() {
    var val_id = $(this).data('val').val_id;
    var stock_id = $(this).data('val').assetId;
    var stock_name = $(this).data('val').name;
    var stock_quantity = $(this).data('val').quantity;

    $("#addQuantity .stock-name").text(stock_name);
    $("#addQuantity input[name='asset']").val(val_id);
    $("#addQuantity input[name='assetId']").val(stock_id);
    $("#addQuantity input[name='quantity']").val(stock_quantity);
  });
  $(".s_openViewDetail").click(function() {
    var stock_id = $(this).data('val').assetId;
    var stock_name = $(this).data('val').name;
    var stock_desc = $(this).data('val').description;
    var stock_category = $(this).data('val').category;
    var stock_totalquantity = $(this).data('val').totalquantity;
    var stock_totalIn = $(this).data('val').totalIn;
    var stock_totalOut = $(this).data('val').totalOut;
    var stock_quantity = $(this).data('val').quantity;

    $("#viewDetails .dt-id").text(stock_id);
    $("#viewDetails .dt-name").text(stock_name);
    $("#viewDetails .dt-detail").text(stock_desc);
    $("#viewDetails .dt-category").text(stock_category);
    $("#viewDetails .dt-quantity").text(stock_totalquantity);
    $("#viewDetails .total .totalIn span").text(stock_totalIn);
    $("#viewDetails .total .totalOut span").text(stock_totalOut);
    $("#viewDetails .st-squantitytbl table tbody").html(stock_quantity);
  });

  /*Category JS - Modal*/
  $(".s_openEditCategory").click(function() {
    var caCode = $(this).data('val').caCode;
    var caName = $(this).data('val').caName;
    var caDescription = $(this).data('val').description;
    var u = $(this).data('val').u;

    $("#editCategory input[name='caCode']").val(caCode);
    $("#editCategory input[name='caName']").val(caName);
    $("#editCategory textarea[name='caDescription']").val(caDescription);
    $("#editCategory input[name='u']").val(u);
  });
  $(".s_openViewCategory").click(function() {
    var caCode = $(this).data('val').caCode;
    var caName = $(this).data('val').caName;
    var caDescription = $(this).data('val').description;
    var caStocks = $(this).data('val').assets;

    $("#viewCategory .ca-code").text(caCode);
    $("#viewCategory .ca-name").text(caName);
    $("#viewCategory .ca-detail").text(caDescription);
    $("#viewCategory .ca-stockstbl table tbody").html(caStocks);
  });

  /*User JS - Modal*/
  $(".s_openEditUser").click(function() {
    var userId = $(this).data('val').userId;
    var userFName = $(this).data('val').userFName;
    var userLName = $(this).data('val').userLName;
    var department = $(this).data('val').department;
    var u = $(this).data('val').u;

    $("#editUser input[name='userId']").val(userId);
    $("#editUser input[name='userFName']").val(userFName);
    $("#editUser input[name='userLName']").val(userLName);
    $("#editUser select[name='department']").val(department);
    $("#editUser input[name='u']").val(u);
    $("#editUser input[name='oldDepartment']").val(department);

  });

  /*Department JS - Modal*/
  $(".s_openEditDept").click(function() {
    var deptCode = $(this).data('val').deptCode;
    var deptName = $(this).data('val').deptName;
    var deptdescription = $(this).data('val').description;
    var u = $(this).data('val').u;

    $("#editDept input[name='deptCode']").val(deptCode);
    $("#editDept input[name='deptName']").val(deptName);
    $("#editDept textarea[name='description']").val(deptdescription);
    $("#editDept input[name='u']").val(u);
  });
  $(".s_openViewDept").click(function() {
    var deptCode = $(this).data('val').deptCode;
    var deptName = $(this).data('val').deptName;
    var deptdescription = $(this).data('val').description;
    var deptUsers = $(this).data('val').deptUsers;

    $("#viewDept .de-code").text(deptCode);
    $("#viewDept .de-name").text(deptName);
    $("#viewDept .de-detail").text(deptdescription);
    $("#viewDept .dept-usertbl table tbody").html(deptUsers);
  });

});

function addItem(u,itemId,itemName,quantity){
  var count = $('#itemForm tr:last').attr('formCount');
  count++;
  $('#itemForm tr:last').after('<tr formCount='+count+'><td><input type="text" class="form-control" placeholder="Item Code" name="itemCode" id="itemCode_'+count+'" readonly><input type="hidden" name="u" id="u_'+count+'"></td><td><input type="text" class="form-control" placeholder="Item Name" name="itemName" id="itemName_'+count+'" disabled></td><td><input type="number" class="form-control" placeholder="Quantity" name="quantity" id="quantity_'+count+'" min="1"></td><td><button type="button" class="btn btn-danger btn-xs" onclick="removeItem('+count+')"><i class="fas fa-times"></i> Remove</button></td></tr>');
  $("#itemForm input[id='itemCode_"+count+"']").val(itemId);
  $("#itemForm input[id='u_"+count+"']").val(u);
  $("#itemForm input[id='itemName_"+count+"']").val(itemName);
  $("#itemForm input[id='quantity_"+count+"']").attr({"max":quantity});
}
function removeItem(formId){
   var row = $("#itemForm tr[formCount="+formId+"]").remove();
}
function SearchFunction() {
  var input, filter, table, tr, td, i;
  input = document.getElementById("SearchCustom");
  filter = input.value.toUpperCase();
  table = document.getElementById("tbl_inventory");
  tr = table.getElementsByTagName("tr");

  for (i = 0; i < tr.length; i++) {
    for (x = 0; x < 3; x++) {
      td = tr[i].getElementsByTagName("td")[x];
      if (td) {
        if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
          tr[i].style.display = "";
          x = 5;
        } else {
          tr[i].style.display = "none";
        }
      }
    }
  }
}
