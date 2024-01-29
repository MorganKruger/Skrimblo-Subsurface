
let entityCounter = 0;
let componentArrays = {}
let componentCache = {}


export const addEntity = (...components) => {
    for (let i = 0; i < components.length; i++) {
        const comp = components[i];
        const compName = Object.getPrototypeOf(comp).constructor.name;

        if (componentArrays[compName] == undefined) componentArrays[compName] = [];
        componentArrays[compName].push(comp);

        comp.id = entityCounter;
    }

    entityCounter++;
}

const blankComponentQuery = (names)=> names.map(_ => []);
export function queryEntities(...args) {
    if (args.length == 0) throw "<queryEntities()> Must give at least one param";

    const names = typeof args[0] == "string" ? args : args.map(i => i.name);

    if (names.length == 1) return [componentArrays[names[0]] ?? []];

    const key = names.toSorted().join("|");

    if (componentCache[key] != undefined) {
        const cache = componentCache[key];
        return names.map(name => cache[name]);
    }

    const all_comps = names.map(name => componentArrays[name] ?? null);

    if (all_comps.includes(null)) return blankComponentQuery(names);

    const comps = all_comps.map(arr => [...arr]);

    lineupWithSmallest(comps);

    componentCache[key] = Object.fromEntries(
        names.map((name, i)=> [name, comps[i]])
    );

    return comps;
}

const lineupWithSmallest = (comps, secondPass = false) => {
    const smallest = comps.reduce((p, c)=> c.length < p.length ? c : p);

    const ids = new Set(smallest.map(comp => comp.id));

    for (let i = 0; i < comps.length; i++) {
        if (comps[i] == smallest) continue;

        for (let j = 0; j < comps[i].length; j++) {
            const comp = comps[i][j];
            
            if (!ids.has(comp.id)) {
                comps[i].splice(j, 1);
                j--;
            }
        }
    }

    let sameLengths = true;
    let matchLength = comps[0].length;
    for (let i = 0; i < comps.length; i++) {
        if (comps[i].length != matchLength) {
            sameLengths = false;
            break;
        }
    }

    if (!sameLengths && !secondPass) {
        return lineupWithSmallest(comps, false);
    }
}

export function unloadScene() {
    componentArrays = {}
    componentCache = {}
}

/** NOTE:
 * upon the program adding or removing components,
 * the system must clear out related component caches
 * OR systematically add/remove them from the cache
 */
