<script lang="ts">
import {
    afterUpdate,
    tick
} from 'svelte';

import moment from 'moment';

export let id: string;
export let name: string;
export let start: string;
export let end: string;
export let row: number;

const dragstartHandler = (event: DragEvent) => {
    if (!event.dataTransfer) {
        return;
    }
    // Set the task id for the dataTransfer
    event.dataTransfer.setData('text/plain', id);

    event.dataTransfer.dropEffect = 'move';
    event.dataTransfer.effectAllowed = 'move';

};

// Hide the task when dragging and move the swimlane behind the day columns
const dragHandler = (event: DragEvent) => {
    const targetElement = event.target as HTMLElement;
    targetElement.classList.add('hidden');

    // move the swimlane behind the the day columns so that we can drag the task over the day columns
    const swimlane = document.getElementById('swimlane');
    if (swimlane) {
        swimlane.style.zIndex = '-1';
    }
};

const dragendHandler = (event: DragEvent) => {
    const targetElement = event.target as HTMLElement;
    targetElement.classList.remove('hidden');
};

// Prevent tasks from being dropped into each other
const preventDrop = (event: DragEvent) => {
    event.stopPropagation();
};

// Determine the width based on the number of days
const getWidth = (start_date: string, end_date: string) => {
    const numDays = moment(end_date).diff(moment(start_date), 'days') + 1;

    return `min-w-[${numDays * 3.5}rem] max-w-[${numDays * 3.5}rem]`;
};

// Position the task based on the start date
const positionTask = () => {
    const draggable = document.getElementById(`task-${id}`);
    const day = document.getElementById(`day-col-${start}`);
    const swimlane = document.getElementById('swimlane');

    if (!draggable || !day || !swimlane) {
        return;
    }

    // Get the distance from the left most edge of the swimlane to the left most edge of the day column
    const distance = day.getBoundingClientRect().left - swimlane.getBoundingClientRect().left;

    // Position the element
    draggable.style.position = 'absolute';
    draggable.style.left = `${distance}px`;

    // Append the task to the corrcet row
    const rowElement = document.getElementById(`task-row-${row}`);
    rowElement && rowElement.appendChild(draggable);
};

// Position the task after the component updates
afterUpdate(() => {
    tick().then(() => {
        positionTask();
    });
});
</script>

<div id="task-{id}" draggable="true" on:drag="{dragHandler}" on:dragend="{dragendHandler}" on:dragstart={dragstartHandler} on:drop="{preventDrop}" role="listbox" tabindex="0" aria-dropeffect="move" class="task px-1 mb-1 h-fit pointer-events-auto {getWidth(start, end)} resize-x">
    <div class="p-2 bg-purple-400 rounded cursor-pointer border border-1 border-solid border-purple-200 max-h-10 overflow-hidden text-ellipsis text-xs hover:shadow-lg">
        <span class="text-white font-bold">
            { name }
        </span>
    </div>
</div>
