import { personToString, composeId } from './modules.covenant.js';


export function PersonList({
  title,
  members = [],
  registry = [],
  ...props
}) {
  console.group("Person List")
  console.log(`Type ${typeof title} ${title}`);
  console.log(`Members [${members.map((member)=>((typeof member === "number" ? registry.find( (i) => (member === i.id)):member))).map(JSON.stringify).join(",")}]`)
  console.log(`Registry [${registry.map(JSON.stringify).join(",")}]`)
  console.groupEnd();
  return (
    <section>
    {title && <div>{title}</div> || <div />
    }
    { members.map(
    (member, index) => {
      if (member) {
        const id = member.id;
        console.log(`Member ${id}`);
        return (<article key={id}>{personToString(member, registry)}</article>);
      } else {
        console.warn(`Undefined member @ ${index}`)
        return(<article key={`.${index}`} />);
      }
    })}
    </section>
  );
}

export default PersonList;