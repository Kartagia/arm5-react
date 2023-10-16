import {useState} from "react";

export function CovenantUI(props) {
  try {
  return (
    <section>
      <header>Covenants</header>
      <main>Covenant list here</main>
      <footer>Covenant status here</footer>
    </section>);
  } catch(err) {
    throw Error(`Render failed`)
  }
};

export default CovenantUI;
