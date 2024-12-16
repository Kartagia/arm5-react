import React, { useEffect, useState } from 'react';
import { Select, Input, InputLabel, MenuItem, FormControl } from '@material-ui/core';
import { fetchGuidelines } from './modules.spellguidelines';

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
            ( (formFilter == null || formFilter === "All" || guideline.form === formFilter) &&
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
                                (result, prop) => ({...result, [prop]: current[prop]}), {}
                            )));
                            setDisableTechSelector(false);
                            setDisableFormSelector(false);
                        } else {
                            const [tech, form, level, name] = event.target.value.split(".");
                            alert(`Changing spell form to ${form}\nChanging spell tech to ${tech}\nChanging spell level to ${level}\n`);
                            setNewSpell(current => ({ ...current, guideline: event.target.value, technique: tech, form, baseLevel: level }));
                            setTechFilter(tech);
                            setFormFilter(form);
                            setDisableTechSelector(true);
                            setDisableFormSelector(true);
                        }
                    }}
                    labelId={guidelineLabelId} name="guideline" value={(newSpell.guideline ? newSpell.guideline : "none")}
                    id={guidelineId}>
                    <MenuItem key="none" value="none"><i>(Select guideline)</i></MenuItem>
                    {guidelines.filter( guideline => (
                        (techFilter === "All" || techFilter === guideline.technique) && (formFilter === "All" || formFilter === guideline.form)
                    )).map(item => (<MenuItem key={keyFunc(item)} value={valueFunc(item)}>{captionFunc(item)}</MenuItem>))}
                </Select>
            </FormControl>
        </footer>
    </div>)
}