import React, { useRef, useState } from "react";
import "./App.css";
import { useDrag, useDrop } from "react-dnd";
import Box from "./components/Box";
import Container from "./components/Container";

const dataBoxes = [
  { id: 0, name: "item 1" },
  { id: 1, name: "item 2" },
  { id: 2, name: "item 3" },
];
const ItemType = "BOX";
const ItemContentType = "CONTAINER";
const TargetType = "DROP_CONTAINER";

const Target = ({ onDrop, children }) => {
  const [{ opacity }, drag] = useDrag({
    type: ItemType,
    options: {
      dropEffect: "move",
    },
    collect: (monitor) => ({
      opacity: monitor.isDragging() ? 1.5 : 1,
    }),
  });

  const [, drop] = useDrop({
    accept: [ItemType],
    drop: (item) => onDrop(item),
    options: {
      dropEffect: "move",
    },
  });

  return (
    <div ref={(node) => drag(drop(node))} className="target">
      {children}
    </div>
  );
};
const InnerTarget = ({
  onDrop,
  children,
  dropTargetRef,
  index,
  item,
  insideInner,
}) => {
  const ref = useRef(null);

  const [{ opacity }, drag] = useDrag({
    type: TargetType,
    options: {
      dropEffect: "move",
    },
    collect: (monitor) => ({
      opacity: monitor.isDragging() ? 1.5 : 1,
    }),
    hover(item, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoveredRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoveredRect.bottom - hoveredRect.top) / 2;
      const mousePosition = monitor.getClientOffset();
      const hoverClientY = mousePosition.y - hoveredRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      item.index = hoverIndex;
    },
  });

  const [isOver, setIsOver] = useState(false);

  const [, drop] = useDrop({
    accept: ItemType,
    hover: (item, monitor) => {
      const dragOffset = monitor.getClientOffset();
      if (!dragOffset) {
        return;
      }

      const targetRect = dropTargetRef.current.getBoundingClientRect();

      const isOverFirstTarget =
        dragOffset.x >= targetRect.left &&
        dragOffset.x <= targetRect.right &&
        dragOffset.y >= targetRect.top &&
        dragOffset.y <= targetRect.bottom;

      setIsOver(isOverFirstTarget);
    },
    drop: (item, monitor) => {
      if (isOver) {
        onDrop(item);
      }
    },
  });

  return (
    <div
      style={
        insideInner
          ? { backgroundColor: "#fff", margin: 10, minWidth: 200 }
          : { backgroundColor: "#fd5", margin: 10, minWidth: 200 }
      }
      ref={(node) => drag(drop(node))}
      className="target"
    >
      {children}
    </div>
  );
};
const TargetRemove = ({ onDrop, children }) => {
  const [, drop] = useDrop({
    accept: ItemType,
    drop: (item) => onDrop(item),
  });

  return (
    <div ref={drop} className="target">
      {children}
    </div>
  );
};

const TargetHeight = ({
  onDrop,
  children,
  index,
  item,
  insideInner,
  setInsideInner,
}) => {
  const ref = useRef(null);
  const [, drop] = useDrop({
    accept: [ItemContentType, TargetType, ItemType],
    drop: (item) => (insideInner ? null : onDrop(item)),
    hover(item, monitor) {
      setInsideInner(false);
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      if (dragIndex === hoverIndex) {
        return;
      }

      const hoveredRect = ref.current.getBoundingClientRect();
      const hoverMiddleY = (hoveredRect.bottom - hoveredRect.top) / 2;
      const mousePosition = monitor.getClientOffset();
      const hoverClientY = mousePosition.y - hoveredRect.top;

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }
      item.index = hoverIndex;
    },
  });

  return (
    <div ref={drop} className="target">
      {children}
    </div>
  );
};

function App() {
  const dropTargetRef = useRef(null);

  const [boxes, setBoxes] = useState([]);
  const [boxesOutSideHeight, setBoxesOutSideHeigh] = useState([]);
  const [containers, setContainers] = useState([{boxes : []}]);
  const [addedItems, setAddedItems] = useState([]);
  const [insideInner, setInsideInner] = useState(false);

  const handleDrop = (item) => {
    if (!Boolean(item?.name)) {
      return;
    }
    setAddedItems([...addedItems, item.name]);

    const updatedBoxesOutSideHeight = boxesOutSideHeight.filter(
      (box) => box.index !== item.index
    );
    setBoxesOutSideHeigh(updatedBoxesOutSideHeight);

    const updatedContainers = containers.map((container) => {
      const hasItem = container.boxes.some((box) => box.index === item.index);

      if (hasItem) {
        container.boxes = container.boxes.filter(
          (box) => box.index !== item.index
        );
      }

      return container;
    });

    const itemExistsInBoxes = boxes.some((box) => box.index === item.index);

    if (itemExistsInBoxes) {
      const updatedBoxes = boxes.filter((box) => box.index !== item.index);
      setBoxes([...updatedBoxes, item]);
    } else {
      setBoxes([...boxes, item]);
    }

    setContainers(updatedContainers);
  };

  const addBoxToContainer = (containerIndex, box) => {
    const updatedContainers = [...containers];
    const containerToUpdate = updatedContainers[containerIndex];

    containerToUpdate?.boxes.push(box);

    setContainers(updatedContainers);
  };

  const handleDropHeight = (item) => {
    if (Boolean(item?.name)) {
      const updatedContainers = [...containers];
      for (
        let containerIndex = 0;
        containerIndex < updatedContainers.length;
        containerIndex++
      ) {
        const containerToUpdate = updatedContainers[containerIndex];
        if (containerToUpdate && containerToUpdate.boxes.length > 0) {
          const updatedBoxes = [...containerToUpdate.boxes];
          const boxIndexToRemove = updatedBoxes.findIndex(
            (box) => box.index === item.index
          );

          if (boxIndexToRemove !== -1) {
            updatedBoxes.splice(boxIndexToRemove, 1);
          }

          containerToUpdate.boxes = updatedBoxes;
        }
      }

      const updatedBoxes = boxes.filter((box) => box.index !== item.index);
      setBoxes(updatedBoxes);

      const itemExistsInBoxesOutSideHeight = boxesOutSideHeight.some(
        (box) => box.index === item.index
      );
      if (!itemExistsInBoxesOutSideHeight) {
        setBoxesOutSideHeigh([...boxesOutSideHeight, item]);
        return;
      } else {
        const updatedBoxesOutSideHeight = boxesOutSideHeight.filter(
          (box) => box.index !== item.index
        );
        setBoxesOutSideHeigh([...updatedBoxesOutSideHeight, item]);
      }

      const containerExists = updatedContainers.some((container) =>
        arraysEqual(container.boxes, updatedBoxes)
      );

      if (!containerExists && updatedBoxes.length > 0) {
        updatedContainers.push({ boxes: updatedBoxes });
        setContainers(updatedContainers);
      }
    } else {

      const containerExists = containers.some((container) =>
        arraysEqual(container.boxes, boxes)
      );

      if (!containerExists && boxes.length > 0) {
        setContainers((prevContainers) => [
          ...prevContainers,
          { boxes: [...boxes] },
        ]);
        setBoxes([]);
      }
    }
  };

  // Function to compare arrays for equality
  function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }

    return true;
  }

  const handleDropToRemove = (item) => {
    // const updatedBoxes = boxes.filter((box) => box.name !== item.name);
    // setBoxes(updatedBoxes);
    // setAddedItems(addedItems.filter((addedItem) => addedItem !== item.name));
  };

  const moveItem = (dragIndex, hoverIndex) => {
    const item = boxes[dragIndex];
    setBoxes((prevState) => {
      const newItems = prevState.filter((i, idx) => idx !== dragIndex);
      newItems.splice(hoverIndex, 0, item);
      return [...newItems];
    });
  };

  const handleDropIn = (containerToUpdate, item) => {
    console.log("bbbb");
    const updatedBoxesOutSideHeight = boxesOutSideHeight.filter(
      (box) => box.index !== item.index
    );

    const updatedBoxes = boxes.filter((box) => box.index !== item.index);

    const updatedContainers = containers.map((container) => {
      if (container === containerToUpdate) {
        const boxIndex = container.boxes.findIndex(
          (boxy) => boxy.index === item.index
        );

        if (boxIndex === -1) {
          return {
            ...container,
            boxes: [...container.boxes, item],
          };
        } else {
          // Move the existing item to the end of the array
          const updatedContainerBoxes = [...container.boxes];
          updatedContainerBoxes.splice(boxIndex, 1); // Remove the item
          updatedContainerBoxes.push(item); // Add it to the end

          return {
            ...container,
            boxes: updatedContainerBoxes,
          };
        }
      } else {
        const updatedOtherBoxes = container.boxes.filter(
          (boxy) => boxy.index !== item.index
        );

        return {
          ...container,
          boxes: updatedOtherBoxes,
        };
      }
    });

    setContainers(updatedContainers);
    setBoxesOutSideHeigh(updatedBoxesOutSideHeight);
    setBoxes(updatedBoxes);
  };

  return (
    <div className="App">
      <h1>Drag and Drop Example</h1>
      <div className="container">
        <div className="source-container">
          <TargetRemove onDrop={handleDropToRemove}>
            {dataBoxes?.length > 0 ? (
              dataBoxes?.map((box, index) => (
                <Box key={index} name={box.name} index={Math.random(index)} />
              ))
            ) : (
              <></>
            )}
          </TargetRemove>
        </div>
        <div className="target-container">
          <Target onDrop={handleDrop}>
            {boxes.map((box, index) => (
              <Box
                key={index}
                name={box.name}
                item={box}
                id={index}
                index={box?.index}
                // moveItem={moveItem}
              />
            ))}
          </Target>
        </div>
        <div
          ref={dropTargetRef}
          className="target-container-height"
          style={
            insideInner
              ? { backgroundColor: "#fff" }
              : { backgroundColor: "pink" }
          }
        >
          <TargetHeight
            ref={dropTargetRef}
            onDrop={handleDropHeight}
            insideInner={insideInner}
            setInsideInner={setInsideInner}
          >
            {containers.length > 0 ? (
              containers.map((container, index) => (
                <InnerTarget
                  style={{ with: 200, backgroundColor: "red" }}
                  key={index}
                  dropTargetRef={dropTargetRef}
                  onDrop={(item) =>
                    insideInner ? handleDropIn(container, item) : null
                  }
                  item={container}
                  index={index}
                >
                  <Container
                    key={index}
                    setInsideInner={setInsideInner}
                    index={index}
                    container={container}
                    moveItem={moveItem}
                    handleDrop={() => addBoxToContainer(container)}
                    insideInner={insideInner}
                  />
                </InnerTarget>
              ))
            ) : (
              <></>
            )}
            {boxesOutSideHeight?.map((item, index) => (
              <Box
                key={index}
                name={item?.name}
                item={item}
                index={item?.index}
                id={index}
                // moveItem={moveItem}
              />
            ))}
          </TargetHeight>
        </div>
      </div>
    </div>
  );
}

export default App;
