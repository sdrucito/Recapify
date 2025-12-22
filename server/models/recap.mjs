import dayjs from 'dayjs';

function Theme(id, name, description = null ){
    this.id = id;
    this.name = name;
    this.description = description;
}
function Background(id, themeId, imagePath, slots, layoutJson){
    this.id = id;
    this.themeId = themeId; //TODO forse da cambiare
    this.imagePath = imagePath;
    this.slots = slots;
    this.layout = typeof layoutJson === "string" ? JSON.parse(layoutJson) : layoutJson;

}
function RecapText(id, pageId, slotIndex, content){
    this.id = id;
    this.pageId = pageId;
    this.slotIndex = slotIndex;
    this.content = content;
}
function RecapPage(id, recapId, pageIndex, background, texts = []){
    this.id = id;
    this.recapId = recapId;
    this.pageIndex = pageIndex;
    this.background = background;
    this.texts = texts;
}
function Recap(id, title, themeId, themeName = null, authorId = null, authorUsername = null,
               visibility, derivedFromRecapId = null, createdAt = null, isTemplate = false,
               pages = []){
    this.id = id;
    this.title = title;
    this.themeId = themeId;
    this.themeName = themeName;
    this.authorId = authorId;
    this.authorUsername = authorUsername;
    this.visibility = visibility;
    this.derivedFromRecapId = derivedFromRecapId;
    this.createdAt = dayjs(createdAt);
    this.isTemplate = isTemplate;
    this.pages = pages;
}
export {Theme, Background, RecapText, RecapPage, Recap};
