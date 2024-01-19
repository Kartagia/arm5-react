/**
 * @module DataSource/Saga/xml
 * The XML representation data source for sagas.
 */

import fs from "fs";
import path from "path";
import { DefaultXmlDataSource } from "../../arm5-react/module.data.xml.js";
import XmlDataSource from "./module.data.xml.js";
import { createQName } from "./module.xml.name.mjs";
import { validQName } from "./module.xml.name.mjs";
import { getNoLogger } from "./module.logging.mjs";
import { createNamespace, createElement } from "./module.data.xml.js";

/**
 * The saga data.
 * @typedef {Object} Saga
 * @property {Fragment} description The description of the saga.
 * @property {string} name The name of the sage.
 * @property {string} id The identifier of the sage.
 * @property {Tribunal[]} [tribunals=[]] The list of the tribunals.
 * @property {Covenant[]} [covenants=[]] The list of the covenants.
 * @property {Magus[]} [magi=[]] The list of the magi.
 * @property {import("../../arm5-react/module.history.js").history} history The history.
 */

/**
 * Create a new identifier from name.
 * @param {string} name The name of the entity.
 * @param {string} [prefix] The prefix of the created identifier.
 */
export function createId(name, prefix = undefined) {
  if (prefix) {
    if (!validId(prefix)) {
      throw new SyntaxError("Invalid prefix: Not a valid identifier");
    }
    const result = prefix
      .concat(".")
      .concat(name.replaceAll(/[\s/\p{Pd}]/gu, "_"));
    if (validId(result)) {
      return result;
    } else {
      throw new SyntaxError("Invalid name");
    }
  } else {
    const result = name.replaceAll(/[\s\p{Pd}]/g, "_");
    if (validId(result)) {
      return result;
    } else {
      throw new SyntaxError("Invalid name");
    }
  }
}
/**
 * A person model.
 * @typedef {Object} Person
 * @property {string} name The primary name of the person.
 * @property {string} id The identifier of the person.
 * @property {string} type The type of the person. Common values
 * are "magus", "grog", "companion".
 */

/**
 * The properties of the grogs.
 * @typedef {Object} GrogProperties
 * @property {string} status The social status of the grog.
 */

/**
 * The properties of the companions.
 * @typedef {Object} CompanionProperties
 * @property {string} status The social status of the grog.
 */

/**
 * The properties only maguses have.
 * @typedef {Object} MagusProperties
 * @property {string} [house] The house of the magus.
 */

/**
 * A magus model.
 * @typedef {Person & MagusProperties} Magus
 */
/**
 * A compaion model.
 * @typedef {Person & CompanionProperties} Companion
 */
/**
 * A grog model.
 * @typedef {Person & GrogProperties} Grog
 */

/**
 * A covenant model representing a single convenant.
 * @typedef {Object} Covenant
 */

/**
 * A tribunal model representing a single tribunal.
 * @typedef {Object} Tribunal
 * @property {Array<Covenant>} covenants The covenants of the tribunal
 * @property {string} name The name of the tribunal.
 * @property {string} description The decription of the tribunal.
 * @property {import("./module.history.js").history} history The history of the tribunal.
 */

/**
 * Create a new magus element.
 * @param {Element} personElement The magus element.
 * @returns {Magus|Companion|Grog} The magus model.
 */
export function createPerson(personElement, type) {
  const name = personElement.getAttribute("name");
  if (type !== personElement.getAttribute("type")) {
    throw new TypeError("Inconsistent person element type");
  }
  return {
    name,
    type,
    id: personElement.getAttribute("id") || createId(name, type),
    house:
      type === "magus"
        ? personElement.getAttribute("house") || "Orbus"
        : undefined,
  };
}

/**
 * Assing the name space definition to the element. This sets the name space
 * related attributes accordingly.
 * @param {Element} element The element into which the XML name space is assigned.
 * @param {NameSpace} nameSpace The name space options.
 */
export function setupNameSpace(
  element,
  { uri, prefix = null, location = null }
) {
  if (prefix == null) {
    element.setAttribute("xmlns", uri);
  } else {
    element.setAttribute(`xmlns:${prefix}`, uri);
  }
  if (location) {
    element.setAttribute(
      "xmlns:xsi",
      "http://www.w3.org/2001/XMLSchema-instance"
    );
    element.setAttribute(
      "xsi:schemaLocation",
      `${uri} ${location}`
    );
  }
}

/**
 * Create a person element.
 * @param {*} person
 * @param {"magus"|"grog"|"companion"} type The type of the created node.
 * @param {import("./module.data.xml.js").SchemaOptions & import("./module.data.xml.js").ElementOptions} options the options for the construction.
 * @returns {Element} The DOM element created from teh given person.
 * @throws {DOMException} The name space uri, element name, or prefix was invalid.
 */
export function cretePersonElement(person, type, options = {}) {
  const {
    schemaUri = "https://antti.kautiainen.com/ArM5",
    schemaPath = undefined,
    schemaFile = "convenants.xsd", // Replace with default value.
    schemaLocation = undefined,
    schemaPrefix = null,
    elementName = type,
    owner = new XMLDocument(),
  } = options;

  if (schemaPrefix && !validQName(schemaPrefix)) {
    throw new SyntaxError("Invalid namespace prefix");
  }
  if (!validQName(elementName)) {
    throw new SyntaxError("Invalid element name");
  }

  try {
    // Throw an exception, if the URI is invalid.
    createQName(elementName, { prefix: schemaPrefix, uri: schemaUri });
  } catch (error) {
    throw new SyntaxError("Invalid schema uri");
  }
  try {
    const nameSpace = createNamespace({schemaUri, schemaPrefix, schemaLocation, schemaFile, schemaPath});    
    return createElement(owner, elementName, nameSpace);
  } catch (error) {
    if (error instanceof DOMException) {
      if (error.name === "NamespaceError") {
        throw new SyntaxError("Invalid schema uri");
      } else if (error.name === "InvalidCharacterError") {
        throw new SyntaxError("Invalid prefix or element name");
      }
    } else {
      throw new SyntaxError("", { cause: error });
    }
  }
}


/**
 * Create a new covenant model.
 * @param {Element} covenantElement The covenant element.
 * @param {Array<Magi>} magiList The list of magi structures.
 * @returns {Covenant} The created covenant model.
 */
export function createCovenant(covenantElement, magiList) {
  const name = covenantElement.getAttribute("name");
  const members = {
    /**
     * The identifeirs of the magi belonging to the covenant.
     * @type {Array<string>}
     */
    magi: [],
    /**
     * The identifiers of the companions belonging to the covenant.
     * @type {Array<string>}
     */
    companions: [],
    /**
     * The identifiers of the grog belonging to the covenant.
     * @type {Array<string>}
     */
    grogs: [],
  };
  ["magus", "companion", "grog"].forEach((type) => {
    [...covenantElement.querySelectorAll(type).values()].forEach(
      (memberElement) => {
        const magus = createPerson(memberElement, type);
        magiList.push(magus);
        members[type].push(magus.id);
      }
    );
    [...covenantElement.querySelectorAll(type.concat("ref")).values()].forEach(
      (memberRefElement) => {
        const name = memberRefElement.getAttribute("name");
        const id = memberRefElement.getAttribute("id") || createId(name, type);
        members[type].push(id);
      }
    );
  });
  return {
    name,
    id: covenantElement.getAttribute("id") || createId(name, "covenant"),
    members,
  };
}
/**
 * Create a new tribunal model.
 * @param {Element} tribunalElement
 * @param {Array<Covenant>} covenantList The list of the covenants.
 * @param {Array<Magus>} magiList The list of the magi.
 * @returns {Tribunal} The tribunal of the given tribunal element.
 */
export function createTribunal(tribunalElement, covenantList, magiList) {
  const tribunalName = tribunalElement.getAttribute("name");
  /**
   * The list of the covenant identifiers.
   * @type {string[]}
   */
  const covenants = [];
  /**
   * The list of the magi identifiers.
   * @type {string[]}
   */
  const magi = [];

  // Adding the individual magi to the magi list.
  // - Magi listed in the covenant are added to the magi colleciton.
  [...tribunalElement.querySelectorAll("magus").values()].forEach(
    (magusElement) => {
      const magus = createPerson(magusElement, "magus");
      magiList.push(magus);
      covenants.push(magus.id);
    }
  );

  // Adding the covenants to the covenant list.
  // - Covenant listed on the covenants will be added to the covenant list.
  [...tribunalElement.querySelectorAll("covenant").values()].forEach(
    (covenantElement) => {
      const covenant = createCovenant(covenantElement, magiList);
      covenantList.push(covenant);
      covenants.push(covenant.id);
    }
  );
  // Adding covenant references.
  [...tribunalElement.querySelectorAll("covenantref").values()].forEach(
    (covenantElement) => {
      const name = covenantElement.getAttribute("name");
      const title = covenantElement.querySelector("name")?.textContent || name;
      const id =
        covenantElement.getAttribute("id") || createId(name, "covenant");
      if (covenantList.find((seeked) => seeked.id === id) == null) {
        // Creating placeholder for the referred covenant.
        covenantList.push({
          name,
          title,
          id,
          placeholder: true,
        });
      }
      covenants.push(id);
    }
  );

  return {
    name: tribunalName,
    id:
      tribunalElement.getAttribute("id") || createId(tribunalName, "tribunal"),
    tribunalTitle:
      tribunalElement.querySelector("name")?.textContent || tribunalName,
    covenants,
    magi,
  };
}
/**
 * Redeclaration of the saga for local use.
 * @typedef {import("../../arm5-react/module.data.xml.saga.mjs").Saga} Saga
 */

/**
 * The default saga path.
 * @type {string[]}
 */
var defaultSagaDirectory = [
  (import.meta || globalThis.process).env.cwd(),
  "data",
  "sagas",
];

/**
 * The properties for data delivered from the server.
 * @typedef {Object} DataProperties
 * @property {Saga[]} sagas The displayed sagas.
 */

/**
 * Generating the data properties from XML data source.
 * @returns {DataProperties}
 */

/**
 * Test validity of a saga identifier.
 * @param {string} id The tested identifier.
 * @returns {boolean} True, if and only if the given identifier is valid
 * saga identifier.
 */
export function validId(id) {
  return typeof id === "string" && /^[a-z][-.a-z0-9_]*$/i.test(id);
}

/**
 * Retreive saga.
 * @param {string[]} sagaDirectory
 * @param {string} sagaId The name of the retrieved saga.
 * @param {import("./module.logging.mjs").ILogger} [logger] The logger used to log events.
 * @returns {Promise<Saga>} The promise of the read saga.
 */
export async function fetchSaga(sagaDirectory, sagaId, logger = null) {
  if (!validId(sagaId)) {
    return Response.reject(new SyntaxError("Invalid saga identifier"));
  }

  const sagaDir = path.join(...sagaDirectory, sagaId);
  const dataSource = new DefaultXmlDataSource();
  Promise.all(
    dataSource.retrieve(path.join(sagaDir, "saga.xml")),
    dataSource.retrieve(path.join(sagaDir, "covenants.xml")).catch((error) => {
      if (logger) {
        logger.error(
          `Could not retrieve covenants of the saga ${sagaId}:${error}`
        );
      }
      return null;
    }),
    dataSource.retrieve(path.join(sagaDir, "magi.xml")).catch((error) => {
      if (logger) {
        logger.error(`Could not retrieve magi of the saga ${sagaId}:${error}`);
      }
      return null;
    })
  ).then((/** @type {XMLDocument[]} */ documents) => {
    const [sagaDoc, covenantsDoc, magiDoc] = documents;
    /**
     * The tribunals of the saga.
     * @type {Tribunal[]}
     */
    const tribunals = [];
    /**
     * The covenant of the saga.
     * @type {Covenant[]}
     */
    const covenants = [];
    /**
     * The magi of the saga.
     * @type {Magus[]}
     */
    const magi = [];
    if (magiDoc?.documentElement.tagName === "magi") {
      [...magiDoc.documentElement.querySelectorAll("magus").values()].forEach(
        (magus) => {
          magi.push(createPerson(magus, "magus"));
        }
      );
    }
    if (covenantsDoc?.documentElement.tagName === "covenants") {
      [
        ...covenantsDoc.documentElement.querySelectorAll("covenant").values(),
      ].forEach((covenant) => {
        covenants.push(createCovenant(covenant, magi));
      });
    }
    const sagaElement = sagaDoc?.documentElement;
    if (sagaElement?.tagName === "saga") {
      [
        ...sagaDoc.documentElement.querySelectorAll("tribunal").values(),
      ].forEach((tribunal) => {
        tribunals.push(createTribunal(tribunal, covenants, magi));
      });

      const actualSagaName = sagaElement.getAttribute("name");
      if (actualSagaName != sagaId) {
        if (logger) {
          logger.warn(
            `Saga ${sagaId} has different saga name ${actualSagaName}`
          );
        }
      }
      return [
        sagaId,
        /** @type {Saga} */ {
          name: actualSagaName,
          title: sagaDoc.querySelector("name")?.innerHTML || actualSagaName,
          id:
            sagaDoc.documentElement.getAttribute("id") ||
            createId(actualSagaName, "saga"),
          description: sagaDoc.querySelector("description")?.innerHTML,
          tribunals,
          covenants,
          magi,
        },
      ];
    } else {
      return Promise.reject("Invalid saga document");
    }
  });
}

/**
 * Fetches all sagas.
 * @param {string[]} [sourceDirectory] The path to the source directory.
 * Defaults to the default directory of the sata source.
 * @param {import("./module.logging.mjs").ILogger} [logger] The logger used to log messages.
 * @returns {Promise<Saga[]>} The promise of all sagas.
 */
export async function fetchSagas(
  sourceDirectory = (null.logger = null),
  logger = null
) {
  const sagaDir = path.join(...(sourceDirectory || defaultSagaDirectory));
  const sagaFiles = fs
    .readdirSync(sagaDir, { withFileTypes: true })
    .filter((file) => {
      if (file.isDirectory()) {
        const sagaFilePath = path.join(sagaDir, file.name, "saga.xml");
        if (fs.existsSync(sagaFilePath)) {
          const lstat = fs.lstatSync(sagaFilePath);
          return lstat.isFile();
        } else {
          return false;
        }
      } else {
        return false;
      }
    })
    .map((file) => {
      return file.name;
    });
  return Promise.all(
    sagaFiles.map(async (sagaName) => {
      return await fetchSaga([sagaDir], sagaName, logger).catch((error) => {
        if (logger) {
          logger.warn(`Invalid saga ${sagaName} in ${sagaDir}: ${error || ""}`);
        }
        return null;
      });
    })
  ).then((sagas) => sagas.filter((saga) => saga !== null));
}

/**
 * The CRUD class of the Saga data source using XML files.
 */
class SagaFileCRUD {
  /**
   * Create a new XML File data source CRUD.
   * @param {string[]} sagaPath The path to the saga files.
   * Defaults to the current working directory.
   * @param {string[]} [covenantPath] The path to the covenant files.
   * If the path is relative, the path is from saga path.
   * Defaults to the saga path.
   * @param {string[]} [peoplePath] The path to the people files.
   * If the path is relative, the path is from covenant path.
   * Defaults to the covenant path.
   * @param {import("./module.logging.mjs").ILogger} [log] The logger used for logging.
   */
  constructor(sagaPath, covenantPath = null, peoplePath = null, log = console) {
    this.sagaPath = path.join(...(sagaPath || ["."]));
    this.covenantPath = covenantPath
      ? path.join(
          ...(covenantPath.length == 0 || path.isAbsolute(covenantPath[0])
            ? [sagaPath, ...covenantPath]
            : covenantPath)
        )
      : this.sagaPath;
    this.peoplePath = peoplePath
      ? path.join(
          ...(peoplePath.length == 0 || path.isAbsolute(peoplePath[0])
            ? [covenantPath, ...peoplePath]
            : peoplePath)
        )
      : this.covenantPath;

    /**
     * The logger logging the messages.
     * @type {import("./module.logging.mjs").ILogger}
     */
    this.log = log || getNoLogger();
    /**
     * The XML data source for the XML file reading and writing.
     * @type {XmlDataSource}
     */
    this.dataSource = new XmlDataSource({ log: this.log });
  }

  /**
   * Create a new
   * @param {XMLDocument} owner The owner of the created element.
   * @param {*} elementName The element name.
   * @param {Object} options The options of the document.
   * @param {string|null} [options.prefix=null] The name space prefix.
   * @param {string} [options.schemaUri] The URI of the.
   * @returns
   * @throws {SyntaxError} The owner, uri, or
   */
  createElement(owner, elementName, { prefix = null, schemaUri = null }) {
    if (prefix != null && !validQName(prefix)) {
      throw new SyntaxError("Invalid namespace prefix");
    }
    if (!validQName(elementName)) {
      throw new SyntaxError("Invalid element name");
    }

    const uri = schemaUri ?? this.defaultNameSpace;
    try {
      // Throw an exception, if the URI is invalid.
      createQName(elementName, { prefix, uri });
    } catch (error) {
      throw new SyntaxError("Invalid uri");
    }
    try {
      return uri == null && prefix == null
        ? owner.createElement(elementName)
        : owner.createElementNS(uri, `${prefix}:${elementName}`);
    } catch (error) {
      throw SyntaxError("Invalid prefix or uri", { cause: error });
    }
  }

  /**
   * Create an element of the given schema.
   * @param {XMLDocument} owner The owner documetn.
   * @param {string} elementName The schema name.
   * @param {string} [prefix] The schema qualified name prefix.
   * Defaults to the default name space.
   * @param {string} [schemaUri] The scema uri.
   * Defaults to the default name space URI.
   * @param {string} [schemaPath] The schema file path.
   * Defaults to the current directory.
   * @param {string} [schemaName] The name of the schema (without .xsd suffix).
   * Defaults to the element name.
   * @throws {SyntaxError} The schema uri, element name or prefix was invalid.
   */
  createSchemaElement(
    owner,
    elementName,
    {
      prefix = null,
      schemaUri = undefined,
      schemaPath = undefined,
      schemaName = undefined,
    } = {}
  ) {
    if (prefix && !validQName(prefix)) {
      throw new SyntaxError("Invalid namespace prefix");
    }
    if (!validQName(elementName)) {
      throw new SyntaxError("Invalid element name");
    }

    const uri = schemaUri || this.defaultNameSpace;
    try {
      // Throw an exception, if the URI is invalid.
      createQName(elementName, { prefix, uri });
    } catch (error) {
      throw new SyntaxError("Invalid uri");
    }
    const fileName = schemaName || `${elementName}.xsd`;
    const result = this.createElement(owner, elementName, { prefix, uri });
    result.setAttribute(
      "xmlns:xsi",
      "http://www.w3.org/2001/XMLSchema-instance"
    );
    result.setAttribute("xmlns" + (prefix ? `:${prefix}` : ""), uri);
    const schemaLocation = path.join(schemaPath || ".", `${fileName}.xsd`);
    result.setAttribute("xsi:schemaLocation", `${uri} ${schemaLocation}`);
    return result;
  }

  /**
   * Retrieves the saga with given identifier.
   * @param {string} sagaId The saga identifier.
   * @returns {Promise<Saga>} The promise of a saga.
   */
  async retrieve(sagaId) {
    /** @type {import("./module.logging.mjs").ILogger} */
    const logger = this.log;
    if (validId(sagaId)) {
      logger.group(`Retrieve saga ${sagaId}`);
      return fetchSaga([this.sagaPath], sagaId, this.log).then((result) => {
        logger.log("Retrieve successful");
        logger.groupEnd();
        return result;
      });
    } else {
      logger.group(`Retrieve saga ${sagaId}`);
      logger.error("Retrieve failed: Invalid saga identifier");
      logger.groupEnd();
      return Promise.reject(new SyntaxError("Invalid saga identifier."));
    }
  }

  /**
   * Removes a saga from data source.
   * @param {string} sagaId The saga identifier of the removed saga.
   * @returns {Promise<boolean>} The promise of the completion.
   */
  async remove(sagaId) {
    return new Promise((resolve, reject) => {
      if (!validId(sagaId)) {
        // The identifier is invalid.
        resolve(false);
        return;
      }
      const targetPath = path.join(this.sagaPath, sagaId);
      const dirEntry = fs.lstatSync(targetPath);
      if (dirEntry.isDirectory()) {
        try {
          fs.rmdirSync(targetPath, { recursive: true, force: true });
          resolve(true);
        } catch (error) {
          reject(error);
        }
      } else {
        resolve(false);
      }
    });
  }

  /**
   * Create a new saga.
   * @param {Saga} saga The saga.
   * @returns {Promise<string>} The promise of saga id.
   */
  async create(saga) {
    const logger = this.log;
    return new Promise((resolve, reject) => {
      if (saga && saga instanceof Object && "name" in saga) {
        logger.group("Request: Create saga " + saga.name);
        const result = createId(saga.name, "saga");
        if (result == null) {
          logger.error("Request failed: invalid saga name " + saga.name);
          logger.groupEnd();
          return reject("Invalid saga name");
        }
        // Creating the saga directory.
        const newSagaPath = path.join(this.sagaPath, result);
        fs.mkdir(newSagaPath, (err) => {
          if (err) {
            logger.error(
              `Request failed: Could not create new saga directory ${newSagaPath}`,
              err
            );
            logger.groupEnd();
            return reject("Could not create new saga entry.");
          } else {
            logger.log(`Action: Saga directory ${newSagaPath} entry created`);
          }
          // Creating magi document.
          const magiDoc = new XMLDocument();
          const magiElement = this.createSchemaElement(magiDoc, "magi", {
            schemaPath: ["..", ".."],
            schemaName: "covenants",
          });
          magiDoc.documentElement = magiElement;
          if (saga.magi) {
            saga.magi.forEach((magus) => {
              this.createMagus(magiDoc, magus, magiElement);
            });
          }
          const magiFileName = path.join(newSagaPath, "magi.xml");
          this.dataSource.update(magiFileName, magiDoc).then(
            () => {
              logger.log(`Saga creation: Created magi file: ${magiFileName}`);
            },
            (error) => {
              logger.error(
                `Saga creation failed: Could not write the magi document: ${magiFileName}: ${error}`
              );

              return reject(error);
              // TODO: Fall back writing the magi into the saga document.
            }
          );
          // Creating covenants document
          const covenantsDoc = new XMLDocument();
          const covenantsElement = this.createSchemaElement(
            magiDoc,
            "covenants",
            {
              schemaPath: ["..", ".."],
              schemaName: "covenants",
            }
          );
          covenantsDoc.documentElement = covenantsElement;
          this.dataSource
            .update(
              path.join(this.sagaPath, result, "covenants.xml"),
              covenantsDoc
            )
            .then(
              () => {
                logger.log();
              },
              (error) => {
                return reject(error);
              }
            );

          // Creating saga document
          const sagaDoc = new XMLDocument();
          const sagaElement = this.createSchemaElement(sagaDoc, "saga", {
            sagaPath: ["..", ".."],
          });
          sagaDoc.documentElement = sagaElement;
          this.dataSource
            .update(path.join(this.sagaPath, result, "saga.xml"), sagaDoc)
            .then(reject, resolve);

          resolve(result);
        });
      } else {
        reject(new TypeError("Invalid saga"));
      }
    });
  }

  createMagus(magiDoc, magus, magiElement) {
    const magusElement = this.createElement(
      magiDoc,
      magus.placeholder ? "magusref" : "magus",
      this.defaultNameSpace
    );
    magusElement.setAttribute("name", magus.name);
    magusElement.setAttribute("id", magus.id);
    if (magus.house) {
      magusElement.setAttribute("house", magus.house);
    }
    if (!magus.placeholder) {
      // We do have an actual mage - adding additional sections.
    }
    magiElement.appendChild(magusElement);
  }
}

export default SagaFileCRUD;
