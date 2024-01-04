
/**
 * @module skills
 */

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
 * @property {string} [abbreviation] The abbreviation of the skill.
 * @property {string} [description] The description of the skill.
 */

/**
 * Create a new skill.
 * @param {string} skillName The name of the skill.
 * @param {string} [title] The title of the skill. Defaults to the name. 
 * @param {string} [abbreviation] The abbreviation of the skill.
 * @param {string} [description] The description of the skill. 
 * @param {SkillGroupModel} [group] The group of the skill.
 * @returns {SkillModel} The skill model. 
 */
export function createSkill(skillName, title=undefined, abbreviation=undefined, description=undefined, group=undefined) {
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
    description
  };
}


/**
 * @typedef {Object} SkillGroupModel
 * @property {string} groupName The name of the group.
 * @property {string?} [title] The title of the skill. Defaults to the
 * name.
 * @property {string?} [abbreviation] The abbreviation of the skill.
 * @property {string} [description] The description of the skill.
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
const wordRe = /\p{Lu}\p{Ll}*/ug;

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
 * A skill representing a skill group member.
 * @extends {SkillModel}
 */
export class SkillGroupMember {

  /**
   * The group the member belongs to.
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
   */
  get title() {
    return this.name();
  }

  /**
   * The abbreviation of the group.
   */
  get abbreviation() {
    return this.#group.abbreviatedMemberName(this.#member);
  }

  /**
   * The description of the group member.
   */
  get description() {
    return this.#member.description;
  }

  /**
   * The group of the group member.
   */
  get group() {
    return this.#group;
  }
}

/**
 * Create a skill group.
 * @param {string} groupName The group name.
 * @param {string?} abbreviation The group abbreviation.
 * @param {string?} [description] The group description.  Defaults to no description.
 * @param {string?} [groupTitle] The title of the group. Defaults to no description.
 * @param {ToStringer<SkillModel>?} [composeMemberName] The function generating
 * the group member title from the member. Defauls to the
 * function replacing the title generalizer section with member name.
 * @param {ToStringer<SkillModel>?} [abbreviatedMemberName] The function generating
 * the gropu member abbreviated title from the member. Defaults to the function
 * separating the abbreviation with the title of the member.
 * @returns {SkillGroupModel} The skill group model.
 */
export const createSkillGroup = (
  groupName,
  abbreviation,
  description = null,
  groupTitle = null,
  composeMemberName = null,
  abbreviatedMemberName = null
) => {
  if (!validSkillGroupName(groupName)) {
    throw new TypeError("Invalid skill group name");
  } else if (
    groupName.length === 0 ||
    groupName.trim().length !== groupName.length
  ) {
    throw new RangeError("Invalid skill group name");
  }
  if (abbreviation) {
    if (!validAbbreviation(abbreviation)) {
      throw typeof abbreviation === "string"
        ? new RangeError("Invalid abbreviation.")
        : new TypeError("Invalid abbreviation.");
    }
  }
  return {
    groupName,
    abbreviation,
    description,
    title: /** @type {string} */ (groupTitle ? groupTitle : groupName),
    composeMemberName: composeMemberName
      ? composeMemberName
      : /** @type {ToStringer<SkillModel>} */ (skill) => {
          return (
            skill &&
            skill.title &&
            (groupTitle || groupName).replaceAll(
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
    createMember(memberName, title=undefined, abbreviation=undefined, description=undefined) {
      const member = createSkill(memberName, title, abbreviation, description, this);
      return new SkillGroupMember(this, member);
    },
  };
};

