import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import Box from "./Box";
const ItemType = "BOX";
const ItemContentType = "CONTAINER";
const TargetType = "DROP_CONTAINER";
const Container = ({
  container,
  handleDrop,
  boxes,
  containerIndex,
  handleMove,
  moveItem,
  index,
  insideInner,
  setInsideInner,
}) => {
  const ref = useRef(null);
  const [{ isDragging }, drag] = useDrag({
    type: ItemContentType,
    item: { container },
    options: {
      dropEffect: "move",
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });
  const [, drop] = useDrop({
    accept: [ItemType, ItemContentType, TargetType],
    drop: (item) => handleDrop(item),
    hover(item, monitor) {
      setInsideInner(true);
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
      moveItem(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  return (
    <div
      ref={(ref) => drag(drop(ref))}
      className={`target-container ${isDragging ? "dragging" : ""}`}
      // style={insideInner ? {backgroundColor : "#daaaaa"} : {backgroundColor : "#fd5"}}
    >
      {container?.boxes?.map((item, index) => (
        <Box
          key={index}
          name={item?.name}
          index={item?.index}
          item={item}
          id={index}
          // moveItem={moveItem}
          handleMove={(fromIndex, toIndex) =>
            handleMove(containerIndex, fromIndex, toIndex)
          }
        />
      ))}
    </div>
  );
};

export default Container;
