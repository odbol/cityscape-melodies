class Building {


}

class CitySequencer {
    target = new EventTarget();

    constructor(element, opts) {
        this.matrix = new Nexus.Matrix(opts.rows, opts.columns);
        this.matrix.populate.all([0]);
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
        this.element.innerHTML = `<div class="building">${this.renderContents()}</div>`;
    }

    renderContents() {
        let html = '';
        let pattern = this.matrix.pattern;
        for (let row = 0; row < pattern.length; row++) {
            html += this.renderWindowRow(row, pattern[row].length);
        }
         
        return html;
    }

    renderWindowRow(row, numCols) {
        let html = '<div class="windowRow">';
        for (let col = 0; col < numCols; col++) {
            html += this.renderWindow(row, col);
        }
         
        return html + '</div>';
    }

    renderWindow(row, col) {
        return `<button class="window" data-row="${row}" data-col="${col}" />`;
    }

    redraw() {
        let pattern = sequencer.matrix.pattern
        const windows = this.element.querySelectorAll('.window');
        for (let window of windows) {
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
    }

    on(eventName, callback) {
        this.target.addEventListener(eventName, callback);
    }

    onWindowClicked(row, col) {
        this.matrix.toggle.cell(Number(col), Number(row));
        this.target.dispatchEvent(new CustomEvent('change'));
    }

    setGeneratedNotes(notes) {
        const numCols = this.matrix.pattern[0].length;
        for (let note of notes) {
            let column = note.quantizedStartStep % numCols;
            let noteName = Tone.Frequency(note.pitch, 'midi').toNote();
            let row = sequencerRows.indexOf(noteName);
            if (row >= 0) {
                this.matrix.set.cell(column, row, 2 + Math.floor(note.quantizedStartStep / numCols));
            }
        }
        this.redraw();
        // DON'T CALL CHANGE EVENT HERE, it will infinite loop!
    }
}