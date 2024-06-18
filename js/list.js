let currentSort = 'Default';
let search_term = '';
$("#searchError").hide();

reSort(currentSort, assets);

const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

const search = document.getElementById('search');
search.addEventListener('input', (event) => {
    filteredData = assets.filter((item) => {
        return (
            item._id.toLowerCase().includes(search_term) ||
            item.Model.toLowerCase().includes(search_term) ||
            item.Brand.toLowerCase().includes(search_term) ||
            item.Description.toLowerCase().includes(search_term)
        );
    });
    search_term = event.target.value.toLowerCase();
    if (filteredData.length > 0) {
        $("#assetTable").show();
        $("#searchError").hide();
        reSort(currentSort, filteredData);
    } else {
        $("#assetTable").hide();
        $("#searchError").show();
    }
});

function statusConverter(status) {
    if (status === undefined) {
        return '<i class="bi-question-circle-fill" data-bs-toggle="tooltip" data-bs-title="Unknown" data-bs-placement="right"></i>';
    } else if (status === 0) {
        return '<i class="bi bi-check-circle-fill text-info" data-bs-toggle="tooltip" data-bs-title="Spare" data-bs-placement="right"></i>';
    } else if (status === 1) {
        return '<i class="bi bi-check-circle-fill text-success" data-bs-toggle="tooltip" data-bs-title="In Service" data-bs-placement="right"></i>';
    } else if (status === 2) {
        return '<i class="bi bi-clock-fill text-warning" data-bs-toggle="tooltip" data-bs-title="Retired" data-bs-placement="right"></i>';
    } else if (status === 3) {
        return '<i class="bi bi-currency-exchange text-warning" data-bs-toggle="tooltip" data-bs-title="Sold" data-bs-placement="right"></i>';
    } else if (status === 4) {
        return '<i class="bi bi-question-circle-fill text-danger" data-bs-toggle="tooltip" data-bs-title="Lost" data-bs-placement="right"></i>';
    } else if (status === 5) {
        return '<i class="bi bi-exclamation-circle-fill text-danger" data-bs-toggle="tooltip" data-bs-title="Stolen" data-bs-placement="right"></i>';
    } else {
        return '<i class="bi bi-bug-fill text-danger" data-bs-toggle="tooltip" data-bs-title="Error" data-bs-placement="right"></i>';
    }
}

function reSort(sortValue, assetList) {
    $("#assetTable").show();
    currentSort = sortValue;
    //let sortValue = document.getElementById("sortDropdown").value;
    if (sortValue == "Default") {
        defaultSort(assetList);
    } else if (sortValue == "Oldest") {
        oldestSort(assetList);
    } else if (sortValue == "Newest") {
        newestSort(assetList);
    }
    $("#sortDropdown").text(sortValue);
    $("#assetList").html("");
    assetList.forEach(function (asset) {
        $("#assetList").append('<tr><td>' + statusConverter(asset.Status) + '</td><td><a href="/' + asset._id + '"">' + asset._id + '</a></td><td>' + asset.Brand + '</td><td>' + asset.Model + '</td><td>' + asset.Description + '</td></th>')
    });
}

function defaultSort(assetList) {
    assetList.sort((a, b) => {
        if (a.Status === b.Status) {
            if (a.Brand === b.Brand) {
                return a.Model < b.Model ? -1 : 1
            } else {
                return a.Brand < b.Brand ? -1 : 1
            }
        } else {
            return a.Status < b.Status ? -1 : 1
        }
    });
}

function oldestSort(assetList) {
    assetList.sort((a, b) => a.Purchase_Date - b.Purchase_Date);
}

function newestSort(assetList) {
    assetList.sort((a, b) => b.Purchase_Date - a.Purchase_Date);
}