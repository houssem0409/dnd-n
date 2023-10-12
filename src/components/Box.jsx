import React, { useRef } from "react";
import "./../App.css";
import { useDrag, useDrop } from "react-dnd";


const ItemType = "BOX";
const Box = ({ name, index, moveItem }) => {
    const ref = useRef(null);
  
    const [, drag, { isDragging }] = useDrag({
      type: ItemType,
      item: { name, index },
    });
  
    const [, drop] = useDrop({
      accept: ItemType,
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
        moveItem(dragIndex, hoverIndex);
        item.index = hoverIndex;
      },
    });
  
    return (
      <div
        ref={drag}
        className={`box ${isDragging ? "dragging" : ""}`}
      >
        {name}
      </div>
    );
  };

  export default Box