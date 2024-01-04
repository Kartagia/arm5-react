/**
 * @module skills
 */

import { ReferenceLibrary } from "./modules.referencelibrary.mjs";

/**
 * A function converting a value into a string.
 * @template SOURCE
 * @callback ToStringer
 * @param {SOURCE} value The value converted to a string.
 * @returns {string} The string representation of the value.
 */

/**
 * The model of a skill.
 * @typedef {Object} SkillModel
 * @property {string} name The name of the skill.
 * @property {string} [title] The title of the skill. Defaults to the
 * name.
 * @property {SkillGroupModel} [group] The group of the skill.
 * @property {string[]} [skillTypes] The skill types of the skill model.
 * @property {string} [abbreviation] The abbreviation of the skill.
 * @property {string} [description] The description of the skill.
 */

/**
 * Create a new skill.
 * @param {string} skillName The name of the skill.
 * @param {string} [title] The title of the skill. Defaults to the name.
 * @param {string} [abbreviation] The abbreviation of the skill.
 * @param {string} [description] The description of the skill.
 * @param {string[]} [skillTypes] The list of group names. Defaults to the
 * skill types of the group, or ["General"] if group and skill types is undefined.
 * @param {SkillGroupModel} [group] The group of the skill.
 * @returns {SkillModel} The skill model.
 */
export function createSkill(
  skillName,
  title = undefined,
  abbreviation = undefined,
  description = undefined,
  group = undefined,
  skillTypes = [],
) {
  if (!validSkillName(skillName)) {
    throw new TypeError("Invalid skill name");
  }
  if (title && !validSkillName(title)) {
    throw new TypeError("Invalid skill title");
  }
  if (abbreviation && !validAbbreviation(abbreviation)) {
    throw new TypeError("Invalid abbreviation");
  }
  return {
    name: skillName,
    title,
    group,
    abbreviation,
    description,
    skillTypes: (skillTypes ? [...skillTypes] : (group ? [...(group.skillTypes)] : 
    ["General"] ) )
  };
}

/**
 * @typedef {Object} SkillGroupModel
 * @property {string} groupName The name of the group.
 * @property {string?} [title] The title of the skill. Defaults to the
 * name.
 * @property {string?} [abbreviation] The abbreviation of the skill.
 * @property {string} [description] The description of the skill.
 * @property {string[]} [skillTypes] The list of default skill types of the 
 * group members.
 * @property {ToStringer<SkillModel>} [composeMemberName] The composer of the
 * member name. Defaults to the function replacing the placeholder of the title
 * with the title of the skill.
 * @param {ToStringer<SkillModel>?} [abberviatedMemberName] The function generating
 * the gropu member abbreviated title from the member. Defaults to the function
 * separating the abbreviation with the title of the member.
 */

/**
 * Test validity of a name.
 * @param {string} name The tested name.
 * @returns {boolean} True, if and only if the name is a valid name.
 */
const validName = (name) => {
  return (
    typeof name === "string" &&
    name.length &&
    name.trim().length === name.length
  );
};

/**
 * The regular expression matching to a single word.
 * @type {RegExp}
 */
const wordRe = /\p{Lu}\p{Ll}*/gu;

/**
 * Test validity of a skill name.
 * @param {string} name The tested skill name.
 * @returns {boolean} True, if and only if the name is a valid skill name.
 */
export const validSkillName = (name) => {
  return (
    validName(name) &&
    RegExp(
      "^" + "(?<name>" + wordRe + "(?:[\\s\\-]" + wordRe + ")*" + ")" + "$",
      "ug"
    ).test(name)
  );
};

/**
 * Test validity of a skill group name.
 * @param {string} name The tested group nam.e
 * @returns {boolean} True, if and only if the name is a valid group name.
 */
export const validSkillGroupName = (name) => {
  return (
    validName(name) &&
    new RegExp(
      "/^(?:^|" +
        "(?<head>" + // Header Group start
        "(?:" +
        wordRe +
        ")" +
        "(?:\\s" +
        wordRe +
        ")*" +
        ")" + // Header group end
        "\\s)?" + // Header string end
        "(?<placeholder>" + // Placeholder start
        "\\(" +
        wordRe +
        "\\)" +
        ")?" + // Placeholder end
        "(?:$|\\s" +
        "(?:" +
        "(?<tail>" +
        wordRe +
        "(?:\\s" +
        wordRe +
        ")*" +
        ")" +
        ")$" +
        ")",
      "ug"
    ).test(name)
  );
};

/**
 * Test validity of an abbreviation. An abbreviation is a valid abbreviation, if it contains
 * upper case lettters.
 * @param {string} abbreviation The tested abbreviation.
 * @returns {boolean} True, if and only if the name is a valid abbreviation.
 */
export const validAbbreviation = (abbreviation) => {
  return (
    validName(abbreviation) &&
    /^\p{Lu}(?:\p{Ll}+|(?:\.\p{Lu})*)$/u.test(abbreviation)
  );
};

/**
 * Test gropu member abbreviation.
 * @param {string} abbreviation The tested abbreviation.
 * @returns {boolean} True, if and only if the given name is valid group member abbreviation.
 */
export const validGroupMemberAbbreviation = ( abbreviation ) => {
  return (abbreviation.split(/:\s*/g)).every(validAbbreviation);
}

/**
 * The default skill type. 
 * @type {string}
 */
export const defaultSkillType = "General";

/**
 * A skill representing a skill group member.
 * @extends {SkillModel}
 */
export class SkillGroupMember {
  /**
   * The group the member belongs to.
   * @type {SkillGroupModel?}
   */
  #group;

  /**
   * The member of the group.
   */
  #member;

  /**
   * Create a new skill group model.
   * @param {SkillGroupModel} group The group model.
   * @param {SkillModel} member The member model.
   */
  constructor(group, member) {
    this.#group = group;
    this.#member = member;
  }

  /**
   * The name of the member.
   */
  get name() {
    return this.#group.composeMemberName(this.#member);
  }

  /**
   * The title of the member.
   * @type {string}
   */
  get title() {
    return this.name();
  }

  /**
   * The abbreviation of the group.
   * @type {string}
   */
  get abbreviation() {
    return this.#group.abbreviatedMemberName(this.#member);
  }

  /**
   * The description of the group member.
   * @type {string}
   */
  get description() {
    return this.#member.description;
  }

  /**
   * The group of the group member.
   * @type {SkillGroupModel?}
   */
  get group() {
    return this.#group;
  }

  /**
   * Get skill types.
   */
  get skillTypes() {
    return this.#member.skillTypes || this.#group.skillTypes || [defaultSkillType];
  }
}

/**
 * Create a skill group.
 * @param {string?} groupTitle The title of the group.
 * @param {string} [groupName] The group name. Defaults to the group title
 * without parentheses.
 * @param {string?} abbreviation The group abbreviation.
 * @param {string?} [description] The group description.  Defaults to no description. * @param {ToStringer<SkillModel>?} [composeMemberName] The function generating
 * the group member title from the member. Defauls to the
 * function replacing the title generalizer section with member name.
 * @param {ToStringer<SkillModel>?} [abbreviatedMemberName] The function generating
 * the gropu member abbreviated title from the member. Defaults to the function
 * separating the abbreviation with the title of the member.
 * @returns {SkillGroupModel} The skill group model.
 */
export const createSkillGroup = (
  groupTitle,
  abbreviation,
  description = null,
  groupName = null,
  composeMemberName = null,
  abbreviatedMemberName = null
) => {
  if (!validSkillGroupName(groupTitle)) {
    throw new TypeError("Invalid skill group title");
  } else if (
    groupTitle.length === 0 ||
    groupTitle.trim().length !== groupName.length
  ) {
    throw new RangeError("Invalid skill group title");
  }
  const actualGroupName = groupName || groupTitle.replaceAll(/\(\)/g, "");
  if (!validSkillName(actualGroupName)) {
    throw new RangeError("Invalid group name")
  }
  if (abbreviation) {
    if (!validAbbreviation(abbreviation)) {
      throw typeof abbreviation === "string"
        ? new RangeError("Invalid abbreviation.")
        : new TypeError("Invalid abbreviation.");
    }
  }
  return {
    title: groupTitle,
    groupName: actualGroupName,
    abbreviation,
    description,
    composeMemberName: composeMemberName
      ? composeMemberName
      : /** @type {ToStringer<SkillModel>} */ (skill) => {
          return (
            skill &&
            skill.title &&
            groupTitle.replaceAll(
              /\(\p{Lu}\p{Ll}*\)/gu,
              skill.title
            )
          );
        },
    abbreviatedMemberName: abbreviatedMemberName
      ? abbreviatedMemberName
      : /** @type {ToStringer<SkillModel>} */ (skill) => {
          return `${this.abbreviation}: ${skill.abbreviation || skill.title}`;
        },
    createMember(
      memberName,
      title = undefined,
      abbreviation = undefined,
      description = undefined
    ) {
      const member = createSkill(
        memberName,
        title,
        abbreviation,
        description,
        this
      );
      return new SkillGroupMember(this, member);
    },
  };
};

/**
 * Construct an identifier from a valid name.
 * @type {IdFunction<string, string>}
 */
export function idOfName(name, salt = undefined) {
  if (validName(name)) {
    const baseId = name.replaceAll(/\s/g, "_");
    return `${baseId}${salt ? `:$salt` : ""}`;
  } else {
    return false;
  }
}

/**
 * A function determining the identifier of a skill models.
 * @type {IdFunction<string, SkillModel>}
 */
export function skillIdFunction(skill, salt = undefined) {
  return idOfName(skill.name, salt);
}


/**
 * A reference to a skill.
 * @typedef {Object} SkillReference
 * @property {SkillModel} skill The referred skill.
 * @property {SkillGroupModel} [group] The skill group, if skil has a group.
 * @property {ToStringer<SkillReference>} [toString] The stringifier of the reference.
 */

/**
 * Function generating the identifier of the skill reference.
 * @type {IdFunction<string, SkillReference>}
 */
export function skillReferenceId(skillRef, salt = undefined) {
  const groupId = skillRef.group || idOfName(skillRef.group.name);
  const dkillId = idOfName(skillRef.skill.name);
  const baseId = (groupId ? `${groupId}.` : "").concat(dkillId);
  if (salt) {
    return baseId.concat(`:${salt}`);
  } else {
    return baseId;
  }
}

/**
 * The default skill reference library.
 * @type {ReferenceLibrary<string, SkillReference>}
 */
export const defaultSkillRefereceLibrary = new ReferenceLibrary(
  skillReferenceId
);

/**
 * Create a reference to the skill.
 * @param {SkillModel} skill The referred skill.
 * @param {SkillGroupModel} [group] The group of the skill.
 * @param {ReferenceLibrary<string, SkillReference>} [referenceLibrary] The identifier
 * reference library ensuring no two references share identifier.
 * @return {SkillReference|undefined} The created skill reference or an undefined
 * value.
 */
export function createSkillReference(
  skill,
  group = undefined,
  referenceLibrary = undefined
) {
  const id = referenceLibrary
    ? referenceLibrary.createId({
        skill: skill,
        group: group,
      })
    : skill instanceof SkillGroupMember || group == null
    ? skill.title
    : group.composeMemberName(skill);
  if (id) {
    return {
      skill,
      group,
      id,
    };
  } else {
    return undefined;
  }
}
