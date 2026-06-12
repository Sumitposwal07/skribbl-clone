function WordSelector({
  words,
  onSelect
}) {

  return (
    <div>

      <h2>
        Choose A Word
      </h2>

      {words.map(word => (

        <button
          key={word}
          onClick={() =>
            onSelect(word)
          }
        >
          {word}
        </button>

      ))}

    </div>
  );
}

export default WordSelector;