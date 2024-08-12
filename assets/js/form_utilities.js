
var customModelIDs = [];

function toggleElementVisible(textFieldId, isChecked) {
    var textField = document.getElementById(textFieldId);
    textField.style.display = isChecked ? "block" : "none";
}

function getNextFreeModelID() {
    for (var i = 1; i <= 10; i++) {
        if (customModelIDs.includes(i) == false) {
            return i;
        }
    }
    return -1;
}

function addCustomModel() {
    if (customModelIDs.length < 10) {
        const customModelID = getNextFreeModelID();
        var container = document.getElementById("custom-models-container");
        var textField = document.createElement("div");
        textField.innerHTML = `
					<ul class="actions fit">
						<li><input type="text" name="custom-model-${customModelID}" id="custom-model-${customModelID}" value="" placeholder="Custom Model ${customModelID}" /></li>
						<li style="width: 20%; display: flex; align-items: center;"><button type="button" onclick="removeCustomModel(this)">Remove</button></li>
					</ul>
					<ul class="actions fit">
						<li><input type="text" name="custom-model-${customModelID}-batchsize" id="custom-model-${customModelID}-batchsize" value="" placeholder="Batch size"></li>
						<li><input type="text" name="custom-model-${customModelID}-epochs" id="custom-model-${customModelID}-epochs" value="" placeholder="Number of epochs"></li>
					</ul>
					`;
        container.appendChild(textField);
        customModelIDs.push(customModelID);
    }
}

function removeCustomModel(button) {
    var id = button.parentElement.parentElement.children[0].children[0].id;
    var index = customModelIDs.indexOf(parseInt(id.substring(13)));
    customModelIDs.splice(index, 1);
    button.parentElement.parentElement.parentElement.remove();
}

function removeAllCusomModels() {
    var container = document.getElementById("custom-models-container");
    container.innerHTML = "";
    customModelIDs = [];
}

function fullResetForm() {

    removeAllCusomModels();

    var customModelsContainer = document.getElementById("custom-models-container");
    customModelsContainer.innerHTML = "";

    var checkboxes = document.querySelectorAll("input[type='checkbox']");
    for (var i = 0; i < checkboxes.length; i++) {
        checkboxes[i].checked = false;
        var id = checkboxes[i].id;
        var divId = "div-" + id.substring(6) + "_params";
        var div = document.getElementById(divId);
        if (div) {
            div.style.display = "none";
        }
    }
    var form = document.getElementById("config-form");
    form.reset();
}

function downloadYAML() {

    const config = {
        training_id: document.getElementById("training_id").value,
        surrogates: getSelectedSurrogates(),
        dataset: {
            name: document.getElementById("data-dataset").value,
            log10_transform: document.getElementById("data-log10").checked,
            normalise: document.getElementById("data-norm").value
        },
        devices: getSelectedDevices(),
        seed: document.getElementById("misc-seed").value,
        verbose: document.getElementById("misc-verbose").checked,
        losses: document.getElementById("bench-losses").checked,
        dynamic_accuracy: document.getElementById("bench-dyn_acc").checked,
        timing: document.getElementById("bench-timing").checked,
        compute: document.getElementById("bench-compute").checked,
        interpolation: {
            enabled: document.getElementById("bench-interpolation").checked,
            intervals: getInterpolationIntervals()
        },
        extrapolation: {
            enabled: document.getElementById("bench-extrapolation").checked,
            cutoffs: getExtrapolationCutoffs()
        },
        sparse: {
            enabled: document.getElementById("bench-sparse").checked,
            factors: getSparseFactors()
        },
        batch_scaling: {
            enabled: false,
            sizes: []
        },
        UQ: {
            enabled: document.getElementById("bench-uq").checked,
            n_models: document.getElementById("bench-extrapol_cutoffs").value
        },
        compare: document.getElementById("model-compare").checked,
        batch_size: [],
        epochs: []
    };
    const yamlConfig = jsyaml.dump(config);

    const element = document.createElement("a");
    element.setAttribute("href", "data:text/yaml;charset=utf-8," + encodeURIComponent(yamlConfig));
    element.setAttribute("download", "config.yaml");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

function downloadConfig() {
    const config = {
        training_id: document.getElementById("training_id").value,
        surrogates: getSelectedSurrogates(),
        dataset: {
            name: document.getElementById("data-dataset").value,
            log10_transform: document.getElementById("data-log10").checked,
            normalise: document.getElementById("data-norm").value
        },
        devices: getSelectedDevices(),
        seed: document.getElementById("misc-seed").value,
        verbose: document.getElementById("misc-verbose").checked,
        losses: document.getElementById("bench-losses").checked,
        dynamic_accuracy: document.getElementById("bench-dyn_acc").checked,
        timing: document.getElementById("bench-timing").checked,
        compute: document.getElementById("bench-compute").checked,
        interpolation: {
            enabled: document.getElementById("bench-interpolation").checked,
            intervals: getInterpolationIntervals()
        },
        extrapolation: {
            enabled: document.getElementById("bench-extrapolation").checked,
            cutoffs: getExtrapolationCutoffs()
        },
        sparse: {
            enabled: document.getElementById("bench-sparse").checked,
            factors: getSparseFactors()
        },
        batch_scaling: {
            enabled: false,
            sizes: []
        },
        UQ: {
            enabled: document.getElementById("bench-uq").checked,
            n_models: document.getElementById("bench-extrapol_cutoffs").value
        },
        compare: document.getElementById("model-compare").checked,
        batch_size: [],
        epochs: []
    };

    // Get batch sizes and epochs for each surrogate
    const surrogates = ["model-fcnn", "model-deeponet", "model-latent_poly"];
    surrogates.forEach(surrogate => {
        const batchsize = document.getElementById(`model-${surrogate}_batchsize`).value;
        const epochs = document.getElementById(`model-${surrogate}_epochs`).value;
        config.batch_size.push(batchsize);
        config.epochs.push(epochs);
    });
    console.log("Config:");
    console.log(config);
    const yamlContent = jsyaml.dump(config);
    console.log(yamlContent);
    const element = document.createElement("a");
    console.log("Element created");
    element.setAttribute("href", "data:text/yaml;charset=utf-8," + encodeURIComponent(yamlContent));
    console.log("Element href set");
    element.setAttribute("download", "config.yaml");
    console.log("Element download set");
    element.style.display = "none";
    console.log("Element display set");
    document.body.appendChild(element);
    console.log("Element appended");
    element.click();
    console.log("Element clicked");
    document.body.removeChild(element);
    console.log("Element removed");
}

function getSelectedSurrogates() {
    const surrogates = [];
    const surrogateCheckboxes = document.querySelectorAll('input[name^="model-"]');
    surrogateCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            surrogates.push(checkbox.id.replace("model-", ""));
        }
    });
    return surrogates;
}

function getSelectedDevices() {
    const devices = [];
    const deviceCheckboxes = document.querySelectorAll('input[name="misc-devices"]');
    deviceCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            devices.push(checkbox.value);
        }
    });
    return devices;
}

function getInterpolationIntervals() {
    const intervals = [];
    const intervalInput = document.getElementById("bench-interpol_ts").value;
    if (intervalInput) {
        intervals = intervalInput.split(",").map(interval => parseInt(interval.trim()));
    }
    return intervals;
}

function getExtrapolationCutoffs() {
    const cutoffs = [];
    const cutoffInput = document.getElementById("bench-extrapol_cutoffs").value;
    if (cutoffInput) {
        cutoffs = cutoffInput.split(",").map(cutoff => parseInt(cutoff.trim()));
    }
    return cutoffs;
}

function getSparseFactors() {
    const factors = [];
    const factorInput = document.getElementById("bench-extrapol_cutoffs").value;
    if (factorInput) {
        factors = factorInput.split(",").map(factor => parseInt(factor.trim()));
    }
    return factors;
}