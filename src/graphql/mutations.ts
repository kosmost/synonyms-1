// tslint:disable
// this is an auto generated file. This will be overwritten

export const createSynonyms = `mutation CreateSynonyms($input: CreateSynonymsInput!) {
  createSynonyms(input: $input) {
    id
    base
    session
    type
    index
    A
    B
    C
    D
    E
    Answer
    Hint
  }
}
`;
export const updateSynonyms = `mutation UpdateSynonyms($input: UpdateSynonymsInput!) {
  updateSynonyms(input: $input) {
    id
    base
    session
    type
    index
    A
    B
    C
    D
    E
    Answer
    Hint
  }
}
`;
export const deleteSynonyms = `mutation DeleteSynonyms($input: DeleteSynonymsInput!) {
  deleteSynonyms(input: $input) {
    id
    base
    session
    type
    index
    A
    B
    C
    D
    E
    Answer
    Hint
  }
}
`;
export const createPracticeHistory = `mutation CreatePracticeHistory($input: CreatePracticeHistoryInput!) {
  createPracticeHistory(input: $input) {
    id
    username
    result
    tryNum
    answer
    itemId
    sessionId
    partId
    index
    date
    time
    genre
  }
}
`;
export const createSynonymsSrs = `mutation CreateSynonymsSrs($input: CreateSynonymsSrsInput!) {
  createSynonymsSrs(input: $input) {
    username
    contentId
    date
    stageIdx
    times
    others
  }
}
`;
export const updateSynonymsSrs = `mutation UpdateSynonymsSrs($input: UpdateSynonymsSrsInput!) {
  updateSynonymsSrs(input: $input) {
    username
    contentId
    date
    stageIdx
    times
    others
  }
}
`;