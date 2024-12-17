import React, { useEffect, useState } from 'react';
import { Select, Input, InputLabel, MenuItem, FormControl, Typography } from '@material-ui/core';
import { fetchGuidelines, GENERAL_LEVEL } from './modules.spellguidelines';

/**
 * The properties of a spell.
 * 
 * @typedef {Object} SpellProps
 * @property {Spell} data The data entry of the spell.
 */

/**
 * Spell component.
 * @param {SpellProps} props 
 * @returns {import('react').ReactElement}
 */
export function Spell(props) {
    const [spell, setSpell] = useState(props.data);
    return (<div>{spell.name}({spell.teachnique} {spell.form} {spell.level || "Generic"})</div>)
}

/**
 * @template TYPE The type of the art structures.
 * @typedef {Object} ArtSelectorProps 
 * @property {(import('react').ChangeEventHandler)} [onChange] React to the change event.
 * @property {TYPE[]} values The values of the selector.
 * @property {TYPE[]} [defaultValue] The default value of the selector.
 * @property {(value: TYPE) => string} keyFunc Generates the key of an option.
 * @property {(value: TYPE) => string} valueFunc Generates the selection value of an option.
 * @property {(value: TYPE) => import('react').ReactElement} captionFunc Generates the caption of an option.
 */

/**
 *
 * @template [TYPE=string] 
 * @param {ArtSelectorProps} props The proerties of the selector.
 * @returns {import('react').ReactElement}
 */
export function ArtSelector(props) {
    const labelId = getId(props.labelId);
    const [values, setValues] = useState(props.values ? props.values : []);
    const [value, setValue] = useState(props.defaultValue ? props.defaultValue : values[0]);

    // Generate the functions converting option values ot the options.
    const optionsOfValue = {};
    const valueFunc = props.valueFunc ? props.valueFunc : (value) => (value);
    const keyFunc = props.keyFunc ? props.keyFunc : (value) => (value);
    const captionFunc = props.captionFunc ? props.captionFunc : (value) => (value);

    /**
     * Create an option of the selector.
     * @param {TYPE} optionValue The option value.
     * @returns {MenuItem} The menu item of the option value.
     */
    const createOption = (optionValue) => {
        const value = valueFunc(optionValue);
        const key = keyFunc(optionValue);
        const caption = captionFunc(optionValue);
        if (!(value in optionsOfValue)) {
            // The value is a new value - storing it to the options of values.
            optionsOfValue[value] = optionValue;
        }
        return (<MenuItem key={key} value={value}>{caption}</MenuItem>);
    };

    return (<FormControl disabled={props.disabled}>
        <InputLabel id={labelId}>{props.label}</InputLabel>
        <Select name={props.name} id={props.id} value={value} onChange={
            (event) => {
                setValue(event.target.value);
                if (props.onChange) {
                    props.onChange(event);
                }
            }
        } labelid={labelId}>
            {values.map(createOption)}
        </Select>
    </FormControl>)
}

/**
 * @typedef {Object} SpellListProps
 * @property {Spell[]} [entries=[]] The members of the spell list.
 */

var ids = {};

function getId() {
    if (!("useId" in React)) {
        let id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        while (id in ids) {
            id = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
        }
        ids[id] = id.toString(36);
        return `id_${ids[id]}`;
    }
    return React.useId();
}

/**
 * A magnitude modifier modifies a level by magnitude.
 * @typedef {Object} MagnitudeModifier
 * @property {string} name The name of the modifier.
 * @property {number} magnitude The magnitude modifier amount.
 */

/**
 * An interface of stringifiable values.
 * @typedef {Object} Stringifiable
 * @property {() => string} toString Convert the value to the string.
 */

/**
 * Create a new magnitude modifier.
 * @param {string|Stringifiable} name The name of the modifier.
 * @param {number|string} [amount=0] The modification amount. 
 * @returns {MagnitudeModifier} The created magnitude modifier.
 * @throws {SyntaxError} The name was invalid.
 * @throws {SyntaxError} The amount was invalid.
 */
export function magnitudeMod(name, amount = 0) {
    const magnitude = typeof amount === "string" ? Number.parseInt(amount) : amount;
    if (!Number.isSafeInteger(magnitude)) {
        throw new SyntaxError("Invalid magnitude modifier amount " + amount);
    }
    if (!(typeof name == "string" || (typeof name === "object" && name != null && "toString" in name && typeof name.toString === "function"))) {
        throw new SyntaxError("Invalid magnitude modifier name");
    }

    /**
     * @type {MagnitudeModifier}
     */
    const result = {
        name: typeof name === "object" ? name.toString() : name,
        magnitude
    };
    return result;
}

export function magnitudeModToString(mod) {
    return `${mod.magnitude} (${mod.name})`;
}

/**
 * A spell model.
 * @typedef {Object} SpellModel
 * @property {import('./modules.spellguidelines').LevelType} [baseLevel] The base level of the spell.
 * @property {import("module.spellguidelines.js").SpellGuideline} guideline The guideline of the spell.
 * @property {string} [form] The form of the spell.
 * @property {string} [technique] The technique of the spell.
 * @property {import('./modules.spellguidelines').LevelType} [level] The actual level of the spell.
 * @property {string|string[]|MagnitudeModifier} [range] The range of the spell.
 * @property {string|string[]|MagnitudeModifier} [duration] The duration of the spell.
 * @property {string|string[]|MagnitudeModifier} [target] The target of the spell.
 * @property {number} [size=0] The size of the spell target.
 * @property {MagnitudeModifier[]} [modifiers=[]] The other modifiers of the spell.
 * @property {string|import('react').ReactElement} [description] The description of the spell.
 */

const ranges = {
    "Personal": magnitudeMod("Personal", 0),
    "Touch": magnitudeMod("Touch", 1),
    "Eye": magnitudeMod("Eye", 1),
    "Voice": magnitudeMod("Voice", 2),
    "Sight": magnitudeMod("Sight", 3),
    "Arcane Connection": magnitudeMod("Arcane Connection", 4)
};
const durations = {
    "Momentary": magnitudeMod("Momentary"),
    "Concentration": magnitudeMod("Conentration", 1),
    "Diameter": magnitudeMod("Diameter", 1),
    "Sun": magnitudeMod("Sun", 2),
    "Ring": magnitudeMod("Ring", 2),
    "Month": magnitudeMod("Month", 3),
    "Year": magnitudeMod("Year", 4)
};
const targets = {
    "Individual": magnitudeMod("Individual"),
    "Part": magnitudeMod("Part", 1),
    "Group": magnitudeMod("Group", 2),
    "Room": magnitudeMod("Room", 2),
    "Struture": magnitudeMod("Structure", 3),
    "Boundary": magnitudeMod("Boundary", 4)
};

/**
 * Convert magnitude modifiers into modifiers.
 * @param {number|string|string[]|MagnitudeModifier} rdt The rdt value.
 * @returns {Array<MagnitudeModifier|Stringifiable>} The magnitude modifier or stringifiable lisst
 * of the rdt.
 */
export function rdtMagnitudeMod(rdt) {
    switch (typeof rdt) {
        case "string":
            if (rdt in ranges) {
                return [ranges[rdt]];
            } else if (rdt in durations) {
                return [durations[rdt]];
            } else if (rdt in targets) {
                return [targets[rdt]];
            } else {
                // Unknown rdt.
                return [magnitudeMod(rdt)];
            }
        case "number":
            return [magnitudeMod("Size", rdt)];
        case "object":
            if (rdt != null) {
                if (Array.isArray(rdt)) {
                    return rdt.map(val => (rdtMagnitudeMod(val)));
                } else {
                    return [rdt];
                }
            }
        default:
            return [];
    }
}

/**
 * Create a spell summary component.
 * @param {Object} props The spell summary props.
 * @param {SpellModel} props.model The spell model. 
 */
export function SpellSummary(props) {
    const model = props.model;
    /**
     * @type {Array<MagnitudeModifier|Stringifiable>}
     */
    const mods = [];
    const baseLevel = (model.baseLevel == null ? (model.guideline || { level: GENERAL_LEVEL }).level : model.baseLevel);
    if (baseLevel !== GENERAL_LEVEL) {
        mods.push(magnitudeMod("base", baseLevel));
    }
    const rdtToMods = (rdt) => {
        if (Array.isArray(rdt)) {
            return rdt.reduce((result, value) => (rdtToMods(rdt)), []);
        } else if (typeof rdt === "object") {
            if (rdt != null) {
                return [ Object.hasOwnProperty(rdt, "toString") ? rdt.toString() : magnitudeModToString(rdt)];
            } else {
                return [];
            }
        } else if (typeof rdt === "number") {
            // Size modifier.
            return [magnitudeModToString(magnitudeMod("Size", rdt))];
        } else {
            // RDT name.
            // TODO: add determining the modifier.
            return [magnitudeModToString(rdtMagnitudeMod(rdt))];
        }
    }
    mods.push(
        ...[props.range, props.duration, props.target, props.size].reduce(
            (result, rdt) => {
                const modifiers = rdtMagnitudeMod(rdt);
                if (modifiers.length > 0) {
                    result.push(...modifiers.map( val => (Object.getOwnPropertyNames(val).includes("toString") ? val.toString() : magnitudeModToString(val))));
                }
                return result;
            }, []));
    mods.push(...(model.modifiers || []).reduce( 
        (result, mod) => {
            result.push(magnitudeModToString(mod));
            return result;
        }, []
    ));
    console.table(mods);
    console.table(mods.map( value => (Object.getOwnPropertyNames(value).includes("toString") ? value.toString() : magnitudeModToString(value))))
    return (<div className={props.className}>Summary
        ({baseLevel === GENERAL_LEVEL ? `Level${mods.length > 0 ? " - " + mods.map(
            value => (Object.getOwnPropertyNames(value).includes("toString") ? value.toString() : magnitudeModToString(value))
        ).join(" - ") : ""}` : `${mods.map(
            value => (Object.getOwnPropertyNames(value).includes("toString") ? value.toString() : magnitudeModToString(value))
        ).join(" + ")}`})
    </div>)
}

/**
 * @typedef {Object} SpellEditorProps
 * @property {SpellModel} model The spell model. 
 * @property {boolean} [disabled=false] Is the editor disabled.
 * @porperty  
 */

/**
 * 
 * @param {SpellEditorProps} props 
 */
export function SpellEditor(props) {
    const [spell, setSpell] = useState(props.model ? props.model : {});

    const setSpellName = (newName) => {
        setSpell(spell => ({ ...spell, name: newName }));
    }
    const setSpellLevel = (newLevel) => {
        setSpell(spell => ({ ...spell, level: newLevel }));
    }

    if (props.readonly) {
        return (<div className={props.className}></div>);
    } else {
        return (<Container>
            <FormControl disabled={props.disabled}>
                <InputLabel>{ }</InputLabel>
                <Input type={text} name={"name"} placeholder={spellnamePlacehodler} defaultValue={spell.name} onChange={
                    (event) => (setSpellName(event.target.value))
                }></Input>
            </FormControl>
            <FormControl disabled={props.disabled}>

            </FormControl>
            <SpellSummary model={spell} />
        </Container>);
    }
}

/**
 * Create a spell list component.
 * 
 * @param {SpellListProps} props 
 * @returns {import('react').ReactElement}
 */
export default function Spells(props) {
    const [spells, setSpells] = useState(props.entries ? props.entries : []);
    const [techniques, setTechniques] = useState(["Creo", "Intellego", "Muto", "Perdo", "Rego"]);
    const [forms, setForms] = useState([
        "Animal", "Aquam", "Auram", "Corpus", "Herbam",
        "Ignem", "Imaginem", "Mentem", "Terram", "Vim"
    ]);
    const [baseGuidelines, setBaseGuidelines] = useState(props.guidelines ? props.guidelines : []);
    const [guidelines, setGuidelines] = useState(baseGuidelines);
    const [techFilter, setTechFilter] = useState("All");
    const [formFilter, setFormFilter] = useState("All");
    const [disableFormSelector, setDisableFormSelector] = useState(false);
    const [disableTechSelector, setDisableTechSelector] = useState(false);
    const [newSpell, setNewSpell] = useState({});
    const techLabel = "Technique";
    const formLabel = "Form";
    const levelLebel = "Level";
    const nameLabel = "Name";
    const descLabel = "Description";
    const guidelineLabel = "Guideline";
    const techId = getId();
    const formId = getId();
    const levelId = getId();
    const nameId = getId();
    const descId = getId();
    const guidelineId = getId();
    const formLabelId = `${formId}.label`;
    const techLabelId = `${techId}.label`;
    const guidelineLabelId = `${guidelineId}.label`;

    const keyFunc = (guideline) => `${guideline.technique}.${guideline.form}.${guideline.level}.${guideline.name}`;
    const valueFunc = keyFunc;
    const captionFunc = (guideline) => `${guideline.name}${guideline.description == null ? "" : ` ${guideline.description}`}`;

    const filterGuidelines = (formFilter = undefined, techFilter = undefined, guidelines = []) => {
        return guidelines.filter(
            guideline => (
                ((formFilter == null || formFilter === "All" || guideline.form === formFilter) &&
                    (techFilter == null || techFilter === "All" || guideline.techninique === guideline.technique))
            )
        );
    };

    return (<div>
        <header><h1>{props.title ? props.title : "Spells"}</h1></header>
        <main>{(spells.length === 0 ? <i key="">(No spells available at the moment)</i> : spells.map(
            spell => (<Spell key={`${spell.name}(${spell.technique}${spell.form}${spell.level})${spell.ref ? `${spell.ref.toString()}` : ""}`} data={spell} />)
        ))}</main>
        <footer>
            <ArtSelector label={techLabel} values={["All", ...techniques]} disabled={disableTechSelector} value={techFilter} onChange={
                event => {
                    setTechFilter(event.target.value);
                }
            } />
            <ArtSelector label={formLabel} values={["All", ...forms]} disabled={disableFormSelector} value={formFilter} onChange={
                event => {
                    setFormFilter(event.target.value);
                }

            } />
            <FormControl width="100%">
                <InputLabel className="element" id={guidelineLabelId}>{guidelineLabel}</InputLabel>
                <Select className="element"
                    onChange={(event, child = undefined) => {
                        if (event.target.value == "none") {
                            setNewSpell(current => (Object.getOwnPropertyNames(current).filter((prop) => (prop != "guideline")).reduce(
                                (result, prop) => ({ ...result, [prop]: current[prop] }), {}
                            )));
                            setDisableTechSelector(false);
                            setDisableFormSelector(false);
                        } else {
                            const [tech, form, level, name] = event.target.value.split(".");
                            alert(`Changing spell form to ${form}\nChanging spell tech to ${tech}\nChanging spell level to ${level}\n`);
                            setNewSpell(current => ({ ...current, guideline: event.target.value, technique: tech, form, baseLevel: level, 
                                range: ranges.Personal, duration: durations.Momentary, target: targets.Individual, size: 0
                             }));
                            setTechFilter(tech);
                            setFormFilter(form);
                            setDisableTechSelector(true);
                            setDisableFormSelector(true);
                        }
                    }}
                    labelId={guidelineLabelId} name="guideline" value={(newSpell.guideline ? newSpell.guideline : "none")}
                    id={guidelineId}>
                    <MenuItem key="none" value="none"><i>(Select guideline)</i></MenuItem>
                    {guidelines.filter(guideline => (
                        (techFilter === "All" || techFilter === guideline.technique) && (formFilter === "All" || formFilter === guideline.form)
                    )).map(item => (<MenuItem key={keyFunc(item)} value={valueFunc(item)}>{captionFunc(item)}</MenuItem>))}
                </Select>
            </FormControl>
            <Typography>{newSpell.technique} {newSpell.form} {newSpell.level || newSpell.baseLevel}</Typography>
            <Typography>R: {newSpell.range && newSpell.range.name} , D: {newSpell.duration && newSpell.duration.name}, T: {newSpell.target && newSpell.target.name}{
                (newSpell.size != null? `(+${newSpell.size})` : "")}</Typography>
            <FormControl>
                <InputLabel id="descriptionLabel">Desription</InputLabel>
                <Input className="element" id="" name="description" placeholder="Enter spell description here"></Input>
            </FormControl>
            <SpellSummary model={newSpell} />
        </footer>
    </div>)
}