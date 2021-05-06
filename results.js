/*
    htmlTemplate can be used as innerHTML
*/
const htmlTemplate = `
    <div id="header" class="header">
        <img src={DOMManager.homeIcon} />
        <h3>Memory Game</h3>
    </div>
`;
const styleTemplate = `
    grid-template-rows: 4rem;
    grid-template-columns: 50% auto 120px;
    justify-items: center;
    align-content: space-between;
    align-items: center;
`;
class Header {
    constructor(elHeader = null) {
        let elTemp = document.querySelector("#header");
        if(elTemp) elTemp.remove();
        if(elHeader == null) {
            elHeader = document.createElement("div");
        }
        Object.assign(elHeader, this);
    }
}