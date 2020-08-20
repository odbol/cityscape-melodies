const COLS_PER_BUILDING = 8;

class Building {

    constructor(matrix, columnStart, columnEnd) {
        this.matrix = matrix;
        this.columnStart = columnStart;
        this.columnEnd = columnEnd;
    }

    render() {
        const html = `<div class="building" id="building_${this.columnStart}">${this.renderContents()}</div>`;

        return html;
    }
    
    renderContents() {
        let html = '';
        const pattern = this.matrix.pattern;
        for (let row = 0; row < pattern.length; row++) {
            html += this.renderWindowRow(row, pattern[row].length);
        }
        return html;
    }

    renderWindowRow(row) {
        let html = '<div class="windowRow">';
        for (let col = this.columnStart; col < this.columnEnd; col++) {
            html += this.renderWindow(row, col);
        }
         
        return html + '</div>';
    }

    renderWindow(row, col) {
        return `<button class="window" data-row="${row}" data-col="${col}" />`;
    }

}

class CitySequencer {
    buildings = [];
    target = new EventTarget();

    curBeat = 0;

    constructor(element, opts) {
        this.matrix = new Nexus.Matrix(opts.rows, opts.columns);
        this.matrix.populate.all([0]);
        this.numMeasures = opts.numMeasures;
        this.element = document.querySelector(element);

        this.render();

        this.element.addEventListener('click', e => {
            const dataset = e.target.dataset;
            if (dataset.row >= 0) {
                this.onWindowClicked(dataset.row, dataset.col);
            }
        });

        this.target.addEventListener('change', () => this.redraw());
    }

    render() {
        this.element.innerHTML = `<div class="buildings">${this.renderContents()}</div>`;
        this.windows = this.element.querySelectorAll('.window');
    }

    renderContents() {
        let html = '';
        const pattern = this.matrix.pattern;
        for (let buildingIdx = 0; buildingIdx < pattern[0].length / COLS_PER_BUILDING; buildingIdx++) {
            let building = this.buildings[buildingIdx];
            if (!building) {
                const colOffset = buildingIdx * COLS_PER_BUILDING;
                building = new Building(this.matrix, colOffset, colOffset + COLS_PER_BUILDING);
                this.buildings[buildingIdx] = building;
            }
            html += building.render();
        }
         
        return html;
    }

    redraw() {
        let pattern = sequencer.matrix.pattern
        for (let window of this.windows) {
            const {row, col} = window.dataset;
            window.dataset.note = pattern[row][col];
        }
        // let pattern = sequencer.matrix.pattern;
        // for (let row = 0; row < pattern.length; row++) {
        //     for (let col = 0; col < pattern[row].length ; col++) {
        //         this.element.querySelector('')
        //     }
        // }
    }

    next() {
        // TODO: step forward and draw
        this.curBeat = (this.curBeat + 1) % this.matrix.pattern[0].length;

        for (let window of this.windows) {
            const {row, col} = window.dataset;
            window.dataset.highlighted = col == this.curBeat;
        }
    }

    on(eventName, callback) {
        this.target.addEventListener(eventName, callback);
    }

    onWindowClicked(row, col) {
        this.matrix.toggle.cell(Number(col), Number(row));
        this.target.dispatchEvent(new CustomEvent('change'));
    }

    setGeneratedNotes(notes) {
        for (let note of notes) {
            let column = note.quantizedStartStep;
            let noteMidi = note.pitch;
            let row = sequencerRowsMidi.indexOf(noteMidi);
            if (row < 0) {
                // wrap the note around so it fits on the building.
                row = (noteMidi % 12);
                //row = sequencerRowsMidi.length - 1;
            }
            this.matrix.set.cell(column, row, 1);
        }
        this.redraw();
        // DON'T CALL CHANGE EVENT HERE, it will infinite loop!
    }
}