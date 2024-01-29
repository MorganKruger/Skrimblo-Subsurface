import { queryEntities } from "./entity.js";

const systems = {}
const bulk_systems = {}

export function addSystem(component_classes, systemFunc) {
    const component_names = component_classes.map(cls => cls.name);
    
    const key = component_names.join("|");

    if (systems[key] == undefined) systems[key] = [];
    systems[key].push(systemFunc);
}

export function addBulkSystem(component_classes, systemFunc) {
    const component_names = component_classes.map(cls => cls.name);
    
    const key = component_names.join("|");

    if (bulk_systems[key] == undefined) bulk_systems[key] = [];
    bulk_systems[key].push(systemFunc);
}

export function runAllSystems() {
    const keys = Object.keys(systems).map(key => key.split("|"));
    const bulk_keys = Object.keys(bulk_systems).map(key => key.split("|"));

    for (let i = 0; i < keys.length; i++) {
        const component_names = keys[i];
        const components = queryEntities(...component_names);
        const key = component_names.join("|");
        runSystem(key, components);
    }

    for (let i = 0; i < bulk_keys.length; i++) {
        const component_names = bulk_keys[i];
        const components = queryEntities(...component_names);
        const key = component_names.join("|");
        runBulkSystem(key, components);
    }
}

function runSystem(key, components) {
    if (components[0].length == 0) return;

    const sys_funcs = systems[key] ?? [];

    for (let i = 0; i < sys_funcs.length; i++) {
        const func = sys_funcs[i];

        for (let j = 0; j < components[0].length; j++) {
            let params = [];

            for (let k = 0; k < components.length; k++) {
                params.push(components[k][j]);
            }

            func(...params);
        }

    }
}

function runBulkSystem(key, components) {
    if (components[0].length == 0) return;

    const sys_funcs = bulk_systems[key] ?? [];

    for (let i = 0; i < sys_funcs.length; i++) {
        const func = sys_funcs[i];

        func(...components);
    }
}


// addSystem([Position, RigidBody], (pos, rb)=>{
//     // Code
// });

// addBulkSystem([Position, RigidBody], (pos, rb)=>{
//     // Code
// });


// addSystem()
// [[Pos, Rb], [Pos, Rb], [Pos, Rb], [Pos, Rb], [Pos, Rb], [Pos, Rb]]

// addBulkSystem()
// [Pos, Pos, Pos, Pos, Pos, Pos]
// [Rb,  Rb,  Rb,  Rb,  Rb,  Rb ]
