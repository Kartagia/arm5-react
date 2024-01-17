/**
 * @module DataSource/Saga/xml
 * The XML representation data source for sagas.
 */

import fs from "fs";
import path from "path";
import { DefaultXmlDataSource } from "../../arm5-react/module.data.xml.js";
import XmlDataSource from "./module.data.xml.js";

/**
 * A function logging an error message.
 * @callback LogError
 * @param {string} [message=undefined] The logged message.
 * @param {Error} [error=undefined] The error causing the logging.
 */

/**
 * A function logging a mesage.
 * @callback LogFunction
 * @param {any[]} [...parts] The logged parts.
 */

/**
 * A function which opens a group.
 * @callback GroupOpener
 * @param {string} [label] The label of the created group.
 */

/**
 * A function which Closes the topmost group.
 * @callback GroupCloser
 */



/**
 * An interface for loggers.
 * @typedef {Object} ILogger
 * @property {LogFunction} log Logs a message.
 * @property {LogError} error Logs an error message.
 * @property {LogFunction} warn Logs a warning message.
 * @property {LogFunction} debug Logs a debug message.
 * @property {LogFunction} info Logs an information message.
 * @property {GroupOpener} group Opens a new group.
 * @property {GroupCloser} groupEnd Closes the group.
 * @property {GroupOpener} groupCollapsed Opens a new collaped group.
 */

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
    const result = prefix.concat(".").concat(name.replaceAll(/[\s/\p{Pd}]/gu, "_"));
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
 * Create a new covenant model.
 * @param {Element} covenantElement The covenant element.
 * @param {Array<Magi>} magiList The list of magi structures.
 * @returns {Covenant} The created covenant model.
 */
export function createCovenant(covenantElement, magiList) {
  const name = covenantElement.getAttribute("name");
  const members = {
    magi: [],
    companions: [],
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

  [...tribunalElement.querySelectorAll("magus").values()].forEach(
    (magusElement) => {
      const magus = createPerson(magusElement, "magus");
      magiList.push(magus);
      covenants.push(magus.id);
    }
  );

  [...tribunalElement.querySelectorAll("covenant").values()].forEach(
    (covenantElement) => {
      const covenant = createCovenant(covenantElement, magiList);
      covenantList.push(covenant);
      covenants.push(covenant.id);
    }
  );
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
  // eslint-disable-next-line no-undef
  (process || import.meta || window.process).env.cwd(),
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
 * @param {Logger} [logger] The logger used to log events.
 * @returns {Promise<Saga>} The promise of the read saga.
 */
export async function fetchSaga(sagaDirectory, sagaId, logger = null) {
  if (!validId(sagaId)) {
    return Response.reject(new SyntaxError("Invalid saga identifier"));
  }
  
  const sagaDir = path.join(...sagaDirectory);
  const dataSource = new DefaultXmlDataSource();
  Promise.all(
    dataSource.retrieve(path.join(sagaDir, sagaId, "saga.xml")),
    dataSource
      .retrieve(path.join(sagaDir, sagaId, "covenants.xml"))
      .catch((error) => {
        if (logger) {
          logger.error(
            `Could not retrieve covenants of the saga ${sagaId}:${error}`
          );
        }
        return null;
      }),
    dataSource
      .retrieve(path.join(sagaDir, sagaId, "magi.xml"))
      .catch((error) => {
        if (logger) {
          logger.error(
            `Could not retrieve magi of the saga ${sagaId}:${error}`
          );
        }
        return null;
      })
  ).then((/** @type {XMLDocument[]} */ documents) => {
    const [sagaDoc, covenantsDoc, magiDoc] = documents;
    const tribunals = [];
    const covenants = [];
    const magi = [];
    if (magiDoc?.documentElement.tagName === "magi") {
      [...magiDoc.documentElement.querySelectorAll("magus").values()].forEach(
        (magus) => {
          magi.push(createPerson(magus, "magus"));
        }
      );
    }
    if (covenantsDoc?.documentElement.tagName === "covenants") {
      [...covenantsDoc.documentElement.querySelectorAll("covenant").values()].forEach(
        (covenant) => {
          covenants.push(createCovenant(covenant, magi));
        }
      );
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
 * @param {Logger} [logger] The logger used to log messages.
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
   * @param {ILogger} [log] The logger used for logging.
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

    this.log = log;
    this.dataSource = new XmlDataSource({log: this.log});
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
    const uri = schemaUri || this.defaultNameSpace;
    const fileName = schemaName || `${elementName}.xsd`;
    const result = prefix
      ? owner.createElement(elementName)
      : owner.createElementNS(uri, `${prefix}:${elementName}`);
    result.setAttribute(
      "xmlns:xsi",
      "http://www.w3.org/2001/XMLSchema-instance"
    );
    result.setAttribute("xmlns" + (prefix ? `:${prefix}` : ""), fileName);
    const schemaLocation = path.join(
      schemaPath || path.join(["."]),
      `${fileName}.xsd`
    );
    result.setAttribute("xsi:schemaLocation", `${uri} ${schemaLocation}`);
    return result;
  }

  /**
   * Retrieves the saga with given identifier.
   * @param {string} sagaId The saga identifier.
   * @returns {Promise<Saga>} The promise of a saga.
   */
  retrieve(sagaId) {
    return fetchSaga([this.sagaPath], sagaId), this.log;
  }

  delete(sagaId) {
    return new Promise((resolve, reject) => {
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
  create(saga) {
    return new Promise((resolve, reject) => {
      if (saga && saga instanceof Object && "name" in saga) {
        const result = createId(saga.name, "saga");
        fs.mkdir(path.join(this.sagaPath, result), (err) => {
          if (err) {
            reject("Could not create new saga entry.");
          }
          // Creating magi document.
          const magiDoc = new XMLDocument();
          const magiElement = this.createSchemaElement(magiDoc, "magi", {
            schemaPath: ["..", ".."],
            schemaName: "covenants",
          });
          magiDoc.documentElement = magiElement;
          this.dataSource
            .update(path.join(this.sagaPath, result, "magi.xml"), magiDoc)
            .then(resolve, reject);

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
            .then(resolve, reject);

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
      }
    });
  }
}

export default SagaFileCRUD;
