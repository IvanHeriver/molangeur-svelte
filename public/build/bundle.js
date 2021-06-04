
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update$1(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update$1($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init$1(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const createGameStateStore = () => {

        // initialize game state
        const {subscribe, set, update} = writable(null);
        // const myUpdate = (e)=> {
        //     update(e)
            
        // }
        const isBoardCellEmpty = (letters, index) => {
            return letters.filter(ltr=>ltr.board && ltr.index === index).length === 0
        };
        const moveLetter = (id, board, index) => {
            update(state => {
                if (board && !isBoardCellEmpty(state.letters, index)) return state
                state.letters = state.letters.map(ltr => {
                    if (ltr.id === id) {
                        ltr.index = index;
                        ltr.board = board;
                    }
                    return ltr
                });
                return state
            });
        };
        const addLetter = (letter) => {
            update(state => {
                state.letters = [...state.letters, letter];
                return state
            });
        };
        // FIXME: this should be a NewStateFlag or something...
        const addNewLetterFlag = () => {
            update(state => {
                state.new_letters = true;
                return state
            });
        };
        const removeNewLetterFlag = () => {
            update(state => {
                state.new_letters = false;
                return state
            });
        };

        const setJoker = (id, letter) => {
            update(state => {
                state.letters = state.letters.map(e=>{
                    if (e.id === id && e.letter === "_") {
                        e.joker = letter;
                    }
                    return e
                });
                return state;
            });
        };

        const setJokerPicker = (letter, active=false) =>{
            update(state => {
                state.jocker_picker = active;
                state.jocker_picker_letter = {...letter};
                return state
            });
        };

        const fixLetter = (id) => {
            update(state=>{
                state.letters = state.letters.map(e=>{
                    if (e.id === id) {
                        e.free = false;
                    }
                    return e
                });
                return state
            });
        };

        const setPlayers = (players) => {
            update(state => {
                state.players = players;
                return state;
            });
        };

        const setMolangeur = (molangeur) => {
            update(state => {
                state.molangeur = molangeur;
                return state;
            });
        };
        const setEvaluation = (evaluation) => {
            update(state => {
                state.evaluation = evaluation;
                return state
            });
        };
        const setRound = (round) => {
            update(state => {
                state.round = round;
                return state
            });
        };
        const setGameOver = () => {
            update(state => {
                state.game_over = true;
                return state
            });
        };
        return {
            subscribe,
            init: set,

            moveLetter,
            addLetter,
            setJoker,
            fixLetter,

            setPlayers,
            setMolangeur,

            setJokerPicker,
            addNewLetterFlag,
            removeNewLetterFlag,

            setRound,
            setEvaluation,
            setGameOver,
        }

    };

    // const createActionStore = ()=>{
    //     // initialize game state
    //     const {subscribe, set, update} = writable({
    //         moving_board_letter
    //     })


    //     return {
    //         subscribe,
    //         init: set,
    //         moveLetter,
    //         addLetter,
    //     }

    // }

    const createGameGimmickStore = () => {

        // initialize game state
        const {subscribe, set, update} = writable({
            temp_letters: []
        });

        const setTempLetters = (temp_letters) => {
            update(state=>{
                state.temp_letters = temp_letters;
                return state
            });
        };
        return {
            subscribe,
            init: set,
            setTempLetters
        }
    };

    const GameStateStore = createGameStateStore();
    const GameGimmickStore = createGameGimmickStore();

    const isInArray = (array, value) => {
        return array.indexOf(value) !== -1
    };
    const unique = (arr) => {
        const u = new Set(arr);
        return [...u]
    };
    // export const arrHasObj = (arr, obj, keys) => {
    //     if (!keys) keys = Object.keys(obj)
    //     return arr.filter(e=>{
    //         keys.filter(k=>e[k]!==obj[k]).length === 0
    //     }).length > 0
    // }
    const getRowColIndex = (index) => {
        let o = Math.floor(index / 15);
        return {
            row: index - o * 15, 
            col: o
        }
    };
    const getColIndex = (index) => Math.floor(index / 15);
    const getRowIndex = (index) => index - Math.floor(index/15) * 15;
    const getIndexFromRowCol = (row, col) => col * 15 + row;

    const shuffle = (arr) => {
        // source : https://stackoverflow.com/a/2450976
        let current_index = arr.length, tmp_value, random_index;
        // While there remain elements to shuffle, shuffle
        while (0 !== current_index) {
            // Pick a random index from the remaining elements
            random_index = Math.floor(Math.random() * current_index);
            current_index -= 1;
            // Swap the corresponding element with the current element
            tmp_value = arr[current_index];
            arr[current_index] = arr[random_index];
            arr[random_index] = tmp_value;
        }
        return arr;
    };

    // export const getNeighborsIndex = (index) => {
    //     const col = getColIndex(index)
    //     const row = getRowIndex(index)
        
    //     let neighbors = [
    //         getIndexFromRowCol(row, col - 1),
    //         getIndexFromRowCol(row, col + 1),
    //         getIndexFromRowCol(row - 1, col),
    //         getIndexFromRowCol(row + 1, col),
    //     ]
    //     if (row === 0) neighbors[2] = -1
    //     if (row === 14) neighbors[3] = -1
    //     if (col === 0) neighbors[0] = -1
    //     if (col === 14) neighbors[1] = -1
    //     return neighbors
    //     // return neighbors.filter(e=>e>=0)
    // }
    const getNeighborsIndex = (index) => {
        const col = getColIndex(index);
        const row = getRowIndex(index);
        return [
            getTopNeighbor(row, col),
            getBottomNeighbor(row, col),
            getLeftNeightbor(row, col),
            getRightNeightbor(row, col),
        ]
    };
    const getTopNeighbor = (row, col) => {
        if (row === 0) return -1
        return getIndexFromRowCol(row - 1, col)
    };
    const getBottomNeighbor = (row, col) => {
        if (row === 14) return -1
        return getIndexFromRowCol(row + 1, col)
    };
    const getLeftNeightbor = (row, col) => {
        if (col === 0) return -1
        return getIndexFromRowCol(row, col - 1)
    };
    const getRightNeightbor = (row, col) => {
        if (col === 14) return -1
        return getIndexFromRowCol(row, col + 1)
    };

    const getIndexSeq = (start, end, row=true) => {
        // const getIndexFromCoord = (coord) => getIndexFromRowCol(coord.row, coord.col)
        let coord;
        let seq = [start];
        let index = start;
        if (row) {
            while (index != end) {
                coord = getRowColIndex(index);
                index = getRightNeightbor(coord.row, coord.col);
                if (index > 0) {
                    seq.push(index);
                } else {
                    break
                }
                if (index > 224) {
                    throw "Not Supposed to happen: contact developer"
                }
            }
        } else {
            while (index != end) {
                coord = getRowColIndex(index);
                index = getBottomNeighbor(coord.row, coord.col);
                if (index > 0) {
                    seq.push(index);
                } else {
                    break
                }
                if (index > 224) {
                    throw "Not Supposed to happen: contact developer"
                }
            }
        }
        return seq
    };

    // given an array of letter, build the board array
    // with null where there is no letter and the letter otherwise
    const buildBoardIndexArray = (letters) => {
        let arr = Array(15 * 15).fill(null);
        letters.map(e=>arr[e.index] = e);
        return arr
    };

    const consecutiveNonNullItems = (array) => {
        const output = [];
        let  current = null;
        array.map((e, i)=> {
            if (e !== null) {
                if (current !== null) {
                    current.push(e);
                } else {
                    current = [e];
                }
                if (i === array.length - 1) {
                    output.push(current);
                }
            } else {
                if (current !== null) {
                    output.push(current);
                    current = null;
                }
            }
            
        });
        return output
    };

    const buildRowColArray = (letters, byrow=true) => {
        const arr = Array(15).fill(0).map(e=>Array(15).fill(null));
        letters.map(e=>{
            let coord = getRowColIndex(e.index);
            byrow ? arr[coord.row][coord.col] = e : arr[coord.col][coord.row] = e;
        });
        return arr
    };

    // b = ["word", "index", "dir"]

    const LETTERS = {
        _: {pts: 0, n: 2, vowel: true, consonant: true},
        // _: {pts: 0, n: 10, vowel: true, consonant: true},
        A: {pts: 1, n: 9, vowel: true, consonant: false},
        B: {pts: 3, n: 2, vowel: false, consonant: true},
        C: {pts: 3, n: 2, vowel: false, consonant: true},
        D: {pts: 2, n: 3, vowel: false, consonant: true},
        E: {pts: 1, n: 15, vowel: true, consonant: false},
        F: {pts: 4, n: 2, vowel: false, consonant: true},
        G: {pts: 2, n: 2, vowel: false, consonant: true},
        H: {pts: 4, n: 2, vowel: false, consonant: true},
        I: {pts: 1, n: 8, vowel: true, consonant: false},
        J: {pts: 8, n: 1, vowel: false, consonant: true},
        K: {pts: 10, n: 1, vowel: false, consonant: true},
        L: {pts: 1, n: 5, vowel: false, consonant: true},
        M: {pts: 2, n: 3, vowel: false, consonant: true},
        N: {pts: 1, n: 6, vowel: false, consonant: true},
        O: {pts: 1, n: 6, vowel: true, consonant: false},
        P: {pts: 3, n: 2, vowel: false, consonant: true},
        Q: {pts: 8, n: 1, vowel: false, consonant: true},
        R: {pts: 1, n: 6, vowel: false, consonant: true},
        S: {pts: 1, n: 6, vowel: false, consonant: true},
        T: {pts: 1, n: 6, vowel: false, consonant: true},
        U: {pts: 1, n: 6, vowel: true, consonant: false},
        V: {pts: 4, n: 2, vowel: false, consonant: true},
        W: {pts: 10, n: 1, vowel: false, consonant: true},
        X: {pts: 10, n: 1, vowel: false, consonant: true},
        Y: {pts: 10, n: 1, vowel: true, consonant: false},
        Z: {pts: 10, n: 1, vowel: false, consonant: true},
    };
    let ltrs = Object.keys(LETTERS).filter(e=>e!=="_");
    const LTRS = ltrs;

    const CELLS = {
        letter_double: [3, 11, 36, 38, 45, 52, 59, 92, 96, 98, 102, 108,
             116, 122, 126, 128, 132, 165, 172, 179, 186, 188, 213, 221],
        letter_triple: [20, 24, 76, 80, 84, 88, 136, 140, 144, 148, 200, 204],
        word_double: [16, 28, 32, 42, 48, 56, 64, 70, 112, 154, 160, 168, 176, 182, 192, 196, 208],
        word_triple: [0, 7, 14, 105, 119, 210, 217, 224]
    };

    const POINTS = Array(15 * 15).fill(0).map((e, i) => {
        const ld = CELLS.letter_double.indexOf(i)===-1 ? 1 : 2;
        const lt = CELLS.letter_triple.indexOf(i)===-1 ? 1 : 3;
        const wd = CELLS.word_double.indexOf(i)===-1 ? 1 : 2;
        const wt = CELLS.word_triple.indexOf(i)===-1 ? 1 : 3;
        return {
            letter_mutliplier: ld * lt,
            word_multiplier: wd * wt
        }
    });

    let COLS_ARRAY = Array(15).fill(0).map((e, i)=>Array(15).fill(0).map((e, j)=>j + (i * 15)));
    const COLS = COLS_ARRAY;
    let ROWS_ARRAY = Array(15).fill(0).map((e, i)=>Array(15).fill(0).map((e, j)=>(j * 15) + i));
    const ROWS = ROWS_ARRAY;

    const computeAllPossibleWordPositions = () => {
        const positions = {V: Array(225), H: Array(225)};
        COLS.map(C => {
            for (let k = 0; k < 15; k++) {
                    positions.V[C[k]] = [];
                for (let l = 1; l <= (15 - k); l++) {
                    positions.V[C[k]].push(C.slice(k, k+l));

                }
            }
        });
        ROWS.map(R => {
            for (let k = 0; k < 15; k++) {
                positions.H[R[k]] = [];
                for (let l = 1; l <= (15 - k); l++) {
                    positions.H[R[k]].push(R.slice(k, k+l));
                }
            }
        });
        return positions
    };
    let AP = computeAllPossibleWordPositions();
    const WORD_POSITIONS = AP;


    const computeIndexRowColMapping = () => {
        const index_from_row_col = Array(15).fill(0).map(e=>Array(15).fill(0));
        const row_col_from_index = Array(15*15).fill(0);
        const neighbors_from_index = Array(15*15).fill(0);
        const getIndexFromRowCol = (row, col) => col * 15 + row;
        let k = 0;
        for (let col = 0; col<15; col++) {
            for (let row = 0; row<15; row++) {
                index_from_row_col[row][col] = k;
                row_col_from_index[k] = {row, col};
                neighbors_from_index[k] = {
                    top: row > 0 ? getIndexFromRowCol(row-1, col) : null,
                    bottom: row < 14 ? getIndexFromRowCol(row+1, col) : null,
                    left: col > 0 ? getIndexFromRowCol(row, col-1) : null,
                    right: col < 14 ? getIndexFromRowCol(row, col+1) : null,
                };
                k++;
            }
        }
        return {
            FROM_INDEX: row_col_from_index,
            TO_INDEX: index_from_row_col, 
            NEIGHBORS: neighbors_from_index
        }
    };
    const MAPPING = computeIndexRowColMapping();

    let DICO;

    const initDictionnary = (callback) => {
        makeDictionnary(callback);
    };
    const makeDictionnary = (callback) => {
        fetch("./ALL_WORDS.txt").then(e=>e.text()).then(e=>{
            const dico = buildDictionnaryObject(e.split("\r\n"));
            DICO = dico;
            callback();
        });
    };
    const buildDictionnaryObject = (words) => {
        let dico = {};
        const addWordToDico = (w, D, k=0) => {
            if ( w[k]) {
                if (D[w[k]] === undefined) D[w[k]] = {};
                D[w[k]] = addWordToDico(w, D[w[k]], k+1);
            } else {
                D["$"] = w;
                
            }
            return D
        };
        words.map(w=>{
            dico = addWordToDico(w, dico);
        });
        return dico
    };

    const checkWordValidity = (word, k=0, D=DICO) => {
        if (word[k] === undefined) return D["$"] !== undefined
        if(D[word[k]] === undefined) return false 
        return checkWordValidity(word, k+1, D[word[k]])
    };



    // obsolete, I should use the POINTS constant instead
    const computeWordScore = (letters) => {
        const values = letters.map(e=>{
            let letter_value = LETTERS[e.letter].pts;
            let word_multiplier = 1;
            if (e.free) {
                if (isInArray(CELLS.letter_double, e.index)) letter_value *= 2;
                if (isInArray(CELLS.letter_triple, e.index)) letter_value *= 3;
                if (isInArray(CELLS.word_double, e.index)) word_multiplier = 2;
                if (isInArray(CELLS.word_triple, e.index)) word_multiplier = 3;
            }
            return {letter_value, word_multiplier}
        });
        let word_value = values.reduce((p, c)=>p+c.letter_value, 0);
        let word_multiplier = values.reduce((p, c)=>p*c.word_multiplier, 1);
        let free_letter_count = letters.reduce((t, c)=>c.free ? t+1 : t, 0);
        return word_value * word_multiplier + (free_letter_count===7 ? 50 : 0)
    };

    const buildWordsFromFreeCell = (index, arr_fixed_letters) => {
        const getLtrs = (index, full=[], dir="left") => {
            let n = MAPPING.NEIGHBORS[index][dir];
            if (n !== null) {
                if (arr_fixed_letters[n] !== null) {
                    full.push(arr_fixed_letters[n].letter);
                    getLtrs(n, full, dir);
                } 
            }
            return full
        };
        const h_left = getLtrs(index, [], "left").reverse();
        const horizontal = [
            ...h_left, 
            null,
            ...getLtrs(index, [], "right")
        ];
        const v_top = getLtrs(index, [], "top").reverse();
        const vertical = [
            ...v_top, 
            null,
            ...getLtrs(index, [], "bottom")
        ];
        //REFACTOR
        return {
            horizontal: horizontal.length === 1 ? null : horizontal,
            vertical: vertical.length === 1 ? null : vertical,
            null_index: {v: v_top.length, h: h_left.length},
            vertical_fixed_points: vertical.length === 1 ? null : vertical.filter(e=>e!==null).map(e=>LETTERS[e].pts).reduce((p, c)=>p+c),
            horizontal_fixed_points: horizontal.length === 1 ? null : horizontal.filter(e=>e!==null).map(e=>LETTERS[e].pts).reduce((p, c)=>p+c),
        }
    };

    const findValidCellsAndOrthogonalWords = (fixed_letters, arr_fixed_letters) => {
        if (arr_fixed_letters[112] === null) return [{index: 112, vertical: null, horizontal: null}]
        const cells = unique(fixed_letters.map(e=>Object.values(MAPPING.NEIGHBORS[e.index])).flat().sort((a, b)=>a>b));
        return cells.filter(e=>arr_fixed_letters[e]===null).map(e=>{
            return {
                index: e,
                ...buildWordsFromFreeCell(e, arr_fixed_letters),
            }
        })
    };
    const computeFreeConstrainsOfValidCells = (valid_cells, free_letters) => {
        const ltrs = free_letters.map(e=>e.letter);
        return valid_cells.map(cell=>{
            let p = POINTS[cell.index];
            let n_h, w_h, l_h, p_h;
            if (cell.horizontal) {
                n_h = cell.horizontal.length;
                w_h = findWords$1(ltrs, n_h, n_h, cell.horizontal, Array(n_h).fill(null)).map(e=>e.word);
                l_h = w_h.map(e=>e.slice(cell.null_index.h, cell.null_index.h+1));

                p_h = l_h.map(e=>(LETTERS[e].pts * p.letter_mutliplier + cell.horizontal_fixed_points) * p.word_multiplier);
            }
            let n_v, w_v, l_v, p_v;
            if (cell.vertical) {
                n_v = cell.vertical.length;
                w_v = findWords$1(ltrs, n_v, n_v, cell.vertical, Array(n_v).fill(null)).map(e=>e.word);
                l_v = w_v.map(e=>e.slice(cell.null_index.v, cell.null_index.v+1));
                p_v = l_v.map(e=>(LETTERS[e].pts * p.letter_mutliplier + cell.vertical_fixed_points) * p.word_multiplier);
            }
            return {
                index: cell.index,
                v: l_v ? unique(l_v) : null,
                h: l_h ? unique(l_h) : null,
                p,
                p_v,
                p_h,
            }
        })
    };

    const masterMolangeur = (letters, callback) => {
        const configuration = initMasterMolangeur(letters);
        launchMasterMolangeur(configuration, callback);
    };


    const initMasterMolangeur = (letters) => {
        
        const fixed_letters = letters.filter(e=>e.board && !e.free);
        const arr_fixed_letters = buildBoardIndexArray(fixed_letters);

        const free_letters = letters.filter(e=>e.free);

        const valid_cells = findValidCellsAndOrthogonalWords(fixed_letters, arr_fixed_letters);
        const free_constraints = computeFreeConstrainsOfValidCells(valid_cells, free_letters);
        const arr_free_constraints = buildBoardIndexArray(free_constraints);

        const words_positions = computeWordPositions(arr_fixed_letters, valid_cells, free_letters.length);
        
        return {
            words_positions,
            free_letters,
            arr_fixed_letters,
            arr_free_constraints
        }
        
    };

    const launchMasterMolangeur = (configuration, callback) => {
        iteratorMasterMolangeur(0, configuration, [], callback);
    };

    const iteratorMasterMolangeur = (index, configuration, results, callback) => {
        if (index >= configuration.words_positions.length) {
            let words = results.flat().sort((a, b) => b.pts - a.pts);
            // duplicates are due to letters that are in double in the player's rack
            words = removeDuplicatedWords(words);
            callback(words);
        } else {
            results = [
                ...results,
                getPossibleWordsForOneGroup(
                    configuration.words_positions[index],
                    configuration.free_letters,
                    configuration.arr_fixed_letters,
                    configuration.arr_free_constraints,
                    configuration.words_positions[index].dir === "V"
                )
            ];
            setTimeout(()=>{
                iteratorMasterMolangeur(index+1, configuration, results, callback);
            }, 0);
        }
    };


    const removeDuplicatedWords = (arr) => {
        let ids = arr.map(e=>e.word+e.index+e.dir);
        let unique = [...(new Set(ids))];
        return arr.filter((e, i) => {
            let u = unique.indexOf(ids[i]);
            if (u === -1) {
                return false
            } else {
                unique.splice(u, 1);
                return true
            }
        })
    };




    const findWords$1 = (letters, min_length, max_length, fixed_constraints, free_constraints) => {
        const found = [];
        const getWords = (letters, k=0, dico=DICO, free_letters_used=0, joker_positions=[]) => {
            if (k <= max_length) { // if too long, end search
                if (fixed_constraints[k]) { // if fixe letter at this location
                    // if there are valid words with this letter at this location
                    // continue search
                    if (dico[fixed_constraints[k]]) { 
                        getWords(letters, k+1, dico[fixed_constraints[k]], free_letters_used, joker_positions);
                    }
                } else {
                    if (k>=min_length && dico["$"]) { // if existing long enough word, add it
                        found.push({word: dico["$"], n: free_letters_used, joker: joker_positions});
                    }
                    free_letters_used += 1;
                    // continue with the remaining letters
                    for (let i = 0; i<letters.length; i++) {
                        if (free_constraints[k] && free_constraints[k].indexOf(letters[i])===-1) continue
                        if (dico[letters[i]]) { // if there are valid word with this letter at this location
                                let remaining_letters = [...letters.slice(0, i), ...letters.slice(i+1)];
                                getWords(remaining_letters, k+1,  dico[letters[i]], free_letters_used, joker_positions);
                        } else if (letters[i] === "_"){ // if it is a joker
                            // joker_positions = [...joker_positions, k]
                            for (let j = 0; j < LTRS.length; j++) {
                                if (dico[LTRS[j]]) {
                                    let remaining_letters = [...letters.slice(0, i), ...letters.slice(i+1)];
                                    getWords(remaining_letters, k+1, dico[LTRS[j]], free_letters_used,  [...joker_positions, k]);
                                }
                            }
                        }
                        
                    }
                }
            }
        };
        getWords(letters);
        return found
    };

    const computeWordPositions = (board, valid_cell, n_free_letters) => {
        // a position is valid if:
        // 1/ it contains a valid cell
        // 2/ the number of free spot doesn't exceed the number of free letters
        // 3/ it has an empty cell before and after
        const filteringFunction = (P) => {
            let step1 = P.filter(cell_index=>valid_cell.filter(vc=>vc.index===cell_index).length>0).length > 0;
            let step2 = P.filter(cell_index=>board[cell_index]===null).length <= n_free_letters;
            let b = MAPPING.NEIGHBORS[P[0]][before];
            let a = MAPPING.NEIGHBORS[P[P.length-1]][after];
            let step3 = (b === null || board[b] === null) && (a === null || board[a] === null);
            return step1 && step2 && step3
        };

        let before, after;
        before="top";
        after="bottom";
        const V = WORD_POSITIONS.V.map(START_CELL=>{
            let selected = START_CELL.filter(filteringFunction);
            if (selected.length === 0) return null
            return {
                indices: selected[selected.length - 1],
                dim: {min: selected[0].length, max: selected[selected.length - 1].length},
                dir: "V",
            }
        }).filter(e=>e!==null);
        before="left";
        after="right";
        const H = WORD_POSITIONS.H.map(START_CELL=>{
            let selected = START_CELL.filter(filteringFunction);
            if (selected.length === 0) return null
            return {
                indices: selected[selected.length - 1],
                dim: {min: selected[0].length, max: selected[selected.length - 1].length},
                dir: "H"
            }
        }).filter(e=>e!==null);

        return [...V, ...H]
    };


    const getPossibleWordsForOneGroup = (position_group, free_letters, arr_fixed_letters, arr_free_constraints, vertical=true) => {

        const letters = free_letters.map(e=>e.letter);

        let free_c;
        if (vertical) {
            free_c = position_group.indices.map(e=>arr_free_constraints[e] ? arr_free_constraints[e].h : null);
        } else {
            free_c = position_group.indices.map(e=>arr_free_constraints[e] ? arr_free_constraints[e].v : null);
        }
        let fixed_c = position_group.indices.map(e=>arr_fixed_letters[e] ? arr_fixed_letters[e].letter : null);

        // const found_words = U.unique(findWords(letters, position_group.dim.min, position_group.dim.max, fixed_c, free_c).map(e=>e.word))
        const raw_found_words = findWords$1(letters, position_group.dim.min, position_group.dim.max, fixed_c, free_c);
        const found_words = raw_found_words.map(e=>e.word);
        const n_letter_used = raw_found_words.map(e=>e.n);
        const joker_positions = raw_found_words.map(e=>e.joker);

        let pos_multiplier = position_group.indices.map(e=> POINTS[e]);
        let adjacent_point;
        if (vertical) {
            adjacent_point = position_group.indices.map(e=> {
                if (arr_free_constraints[e]===null || arr_free_constraints[e].h===null) return null
                let obj = {};
                arr_free_constraints[e].h.map((l, i)=>obj[l] = arr_free_constraints[e].p_h[i]);
                return obj
            });
        } else {
            adjacent_point = position_group.indices.map(e=> {
                if (arr_free_constraints[e]===null || arr_free_constraints[e].v===null) return null
                let obj = {};
                arr_free_constraints[e].v.map((l, i)=>obj[l] = arr_free_constraints[e].p_v[i]);
                return obj
            });
        }

        const word_letter_points = found_words.map((w, i)=>{
            let a = 0;
            let w_m = 1;
            let t = 0;
            for (let k = 0; k<w.length; k++) {
                let p = (joker_positions[i].indexOf(k) === -1 ? LETTERS[w[k]].pts : 0);
                if (fixed_c[k]===null) {
                    p *= pos_multiplier[k].letter_mutliplier;
                    w_m *= pos_multiplier[k].word_multiplier;
                } 
                if (adjacent_point[k]) {
                    a += adjacent_point[k][w[k]];
                }
                t += p;
            }
            t *=  w_m; 
            return t + a + (n_letter_used[i] === 7 ? 50 : 0)
        });


        const output = found_words.map((e, i) => {
            return {
                index: position_group.indices[0],
                word: e,
                pts: word_letter_points[i],
                dir: vertical ? "V" : "H",
                n: n_letter_used[i],
                joker: joker_positions[i]
            }
        });
        return output
    };

    let GAME;

    const newGame = () => {
        GAME = {
            bag: createBag(),
            board: [],
            players: [{
                id: Math.random().toString().slice(2),
                rack: [],
                score: 0,
            }],
            round: 0
        };
        resetGame(GAME.players[0].id);
        const drawing_result = drawLetters(GAME.bag, GAME.players[0].rack, GAME.round);
        GAME.players[0].rack = drawing_result.letters;
        GAME.bag = drawing_result.bag;
        const game = {
            board: [...GAME.board],
            rack: [...GAME.players[0].rack],
            players: GAME.players.map(e=>{
                return {id: e.id, score: e.score}
            }),
            round: GAME.round,
        };
        updateGame(game);
        // launch master molangeur on the new players game
        masterMolangeur(GAME.players[0].rack, (words)=>{
            updateMolangeur(words);
        });
    };


    const onWordSubmission = (id, free_letters_on_board) => {
        const evaluation = evaluateBoard(free_letters_on_board);
        if (evaluation && evaluation.is_position_valid && evaluation.is_word_valid) {
            
            // retrieve player index:
            const player_index = GAME.players.map(e=>e.id).indexOf(id);
            // add letters to board
            GAME.board = [...GAME.board, ...free_letters_on_board];
            // retrieve remaining letters in rack
            const rack_remaining_letters = GAME.players[player_index].rack.filter(e=>free_letters_on_board.filter(l=>l.id===e.id).length === 0);
            // draw new letter's player
            const drawing_result  = drawLetters(GAME.bag, rack_remaining_letters, GAME.round);
            
            GAME.bag = drawing_result.bag;
            const new_letters = drawing_result.letters;
            GAME.bag = drawing_result.bag;
            // remove letters from player's rack and 
            GAME.players[player_index].rack = [
                ...rack_remaining_letters,
                ...new_letters
            ];
            // update player's score
            GAME.players[player_index].score += evaluation.total_score;
            // update round number
            GAME.round++;
            // update player's game
            const game = {
                board: [...GAME.board],
                rack: [...GAME.players[player_index].rack],
                players: GAME.players.map(e=>{
                    return {id: e.id, score: e.score}
                }),
            };
            updateGame(game);
            // launch master molangeur on the new players game
            updateMolangeur(); 
            masterMolangeur([...GAME.board, ...GAME.players[player_index].rack], (words)=>{
                if (words.length !== 0) {
                    updateMolangeur(words);
                } else {
                    gameOver();
                }
            });
            

        }
    };
    const evaluateBoard = (free_letters_on_board) => {
        // retrieve necessary data
        const fixed_letters = GAME.board;
        const board_letters = [...fixed_letters, ...free_letters_on_board];
        // these contains the same data but in "board" dimension
        // which makes it easier to access in some cases
        const arr_board_letters = buildBoardIndexArray(board_letters);
        const arr_fixed_letters = buildBoardIndexArray(fixed_letters);

        // ------------------------------------------------------------
        // This section deals with the positionning of the new letters
        const new_letter_on_center_cell = free_letters_on_board.filter(e=>e.index === 112).length === 1;
        const new_letters_on_same_row = unique(free_letters_on_board.map(e=>getRowIndex(e.index))).length === 1; 
        const new_letters_on_same_col = unique(free_letters_on_board.map(e=>getColIndex(e.index))).length === 1;
        const new_letters_with_neighbors = free_letters_on_board.map(e=>{
            return getNeighborsIndex(e.index).filter(n=>arr_fixed_letters[n] !== null)
        }).flat().length > 0;
        let no_interletter_space = false;
        let start = Math.min(...free_letters_on_board.map(e=>e.index));
        let end   = Math.max(...free_letters_on_board.map(e=>e.index));
        if (new_letters_on_same_row) {
            no_interletter_space = getIndexSeq(start, end, true).filter(e=>arr_board_letters[e]===null).length === 0;
        } else if (new_letters_on_same_col) {
            no_interletter_space = getIndexSeq(start, end, false).filter(e=>arr_board_letters[e]===null).length === 0;
        }
        const is_position_valid = (new_letter_on_center_cell || new_letters_with_neighbors)
             && (new_letters_on_same_row || new_letters_on_same_col) && no_interletter_space;

        if (!is_position_valid) return false
        // ------------------------------------------------------------
        // This section deals with building, checking the words and 
        // scoring
        const words = findWords(board_letters);
        const new_words = words.filter(w=>w.word.filter(e=>e.free).length > 0);
        const actual_words = new_words.map(e=>buildWord(e.word));

        if (actual_words.length === 0) return false

        const words_validity = actual_words.map(e=>checkWordValidity(e));
        const is_word_valid = words_validity.reduce((p, c) => p && c, true);
        const words_free_letter_count = new_words.map(e=>e.word.filter(l=>l.free).length);
        const main_word_index = words_free_letter_count.indexOf(Math.max(...words_free_letter_count));
        const word_scores = new_words.map(e=>computeWordScore(e.word));
        const total_score = word_scores.reduce((p, c)=>p+c, 0);

        let last_letter_index = new_words[main_word_index].word.slice(-1)[0].index;
        return {
            is_position_valid,
            is_word_valid,
            words: actual_words,
            words_validity,
            full_words: new_words,
            letters: free_letters_on_board,
            main_word_index,
            word_scores,
            total_score,
            last_letter_index
        }

    };


    const createBag = () => {
        const bag_letters = Object.keys(LETTERS).map(e=>e.repeat(LETTERS[e].n).split("")).flat();
        let bag = bag_letters.map(e=>{
            return {
                id: Math.random().toString().slice(2),
                letter: e,
                joker: ""
            }
        });
        bag = shuffle(bag);
        return bag
    };

    // FIXME: draw letters untile at least two consonants and two vowels
    //        or one consonant and one vowel, or something like this
    const drawLetters = (bag, remaining_letters, round) => {
        const draw = () => {
            return bag.slice(0, n)
        };
        const n = 7 - remaining_letters.length;
        let letters = draw();
        let m = round < 15 ? 2 : 1;
        let n_vowel = remaining_letters.filter(e=>LETTERS[e.letter].vowel).length;
        let n_consonant = remaining_letters.filter(e=>LETTERS[e.letter].consonant).length;
        let n_v = letters.filter(e=>LETTERS[e.letter].vowel).length;
        let n_c = letters.filter(e=>LETTERS[e.letter].consonant).length;
        let invalid = ((n_vowel + n_v) < m) || ((n_consonant + n_c) < m);
        let k = 0;
        while (invalid && k < 10) {
            bag = shuffle(bag);
            letters = draw();
            n_v = letters.filter(e=>LETTERS[e.letter].vowel).length;
            n_c = letters.filter(e=>LETTERS[e.letter].consonant).length;
            invalid =  ((n_vowel + n_v) < m) || ((n_consonant + n_c) < m);
            k++;
        }
        return {letters, bag: bag.slice(n)}
    };

    const findWords = (letters) => {
        const letters_per_col = buildRowColArray(letters, false);
        const letters_per_row = buildRowColArray(letters, true);

        const h_words = letters_per_row.map(e=>consecutiveNonNullItems(e).filter(e=>e.length>1).map(e=>{return {vertical: false, word: e}})).flat();
        const v_words = letters_per_col.map(e=>consecutiveNonNullItems(e).filter(e=>e.length>1).map(e=>{return {vertical: true, word: e}})).flat();

        return [...h_words, ...v_words]
    };

    const buildWord = (letters) => {
        return letters.map(e=>{
            let l = e.letter === "_" ? e.joker : e.letter;
            return l
        }).reduce((p, c)=>p+c)
    };

    const getEmptyRackSlote = (GSS) => {
        const occupied_slot = GSS.letters.filter(e=>!e.board).map(e=>e.index);
        return Array(7).fill(0).map((e,i)=>i).filter(e=>occupied_slot.indexOf(e) === -1)
    };

    const moveAllFreeLettersToRack = () => {
        const GSS = get_store_value(GameStateStore);
        const empty_slot = getEmptyRackSlote(GSS);
        let k = -1;
        GSS.letters.filter(e=>e.board && e.free).map(e=>{
            k++;
            GameStateStore.moveLetter(e.id, false, empty_slot[k]);
            GameStateStore.setJoker(e.id, "");
        });
        GameStateStore.setEvaluation(false);
    };

    const resetGame = (id) => {
        GameStateStore.init({
            id: id,
            letters: [],
            molangeur: {
                score: 0,
                next_score: 0,
                current_words: [],
                next_words: [],
            },
            players: []
        });
    };

    const updateGame = (game) => {
        const GSS = get_store_value(GameStateStore);
        const empty_slot = getEmptyRackSlote(GSS);
        const board_letters_indices = game.board.map(e=>e.index);
        game.board.map(e=>{
            // verify that it exists 
            if (GSS.letters.filter(l=>l.id===e.id).length !== 1) {
                throw "A letter that should exist, doesn't..."
            }
            // fix them and move them 
            GameStateStore.fixLetter(e.id);
            GameStateStore.moveLetter(e.id, true, e.index);
        });
        let k = 0;
        game.rack.map(e=> {
            // if the letter already exists, 
            if (GSS.letters.filter(l=>l.id===e.id).length === 1) { 
                // and is on the board on an occupied spot
                // if (e.board && board_letters_indices.indexOf(e.index) !== -1) {
                if (e.board && board_letters_indices.indexOf(e.index) !== -1) {
                    // move it back to the rack
                    GameStateStore.moveLetter(e.id, false, empty_slot[k]);
                    GameStateStore.setJoker(e.id, "");
                    k++;
                }
            } else {// if letter's doesn't exist add it
                // add it in the rack
                e.index = empty_slot[k];
                e.board = false;
                e.free = true;
                GameStateStore.addLetter(e);
                k++;
            }
        });
        GameStateStore.setPlayers(game.players);
        GameStateStore.setEvaluation(false);
        GameStateStore.setRound(game.round);
    };

    const updateMolangeur = (words=null) => {
        const GSS = get_store_value(GameStateStore);
        if (words) {
            GameStateStore.setMolangeur({
                score:  GSS.molangeur.score,
                next_score: words[0].pts,
                current_words: GSS.molangeur.next_words,
                next_words: words,
                searching: false, 
            });
        } else {
            GameStateStore.setMolangeur({
                score:  GSS.molangeur.score + GSS.molangeur.next_score,
                next_score: GSS.molangeur.next_score,
                current_words: GSS.molangeur.next_words,
                next_words: GSS.molangeur.next_words,
                searching: true, 
            });
        }
        
    };

    const askForNewGame = () => {
        newGame();
    };
    const askBoardEvaluation = () => {
        const GSS = get_store_value(GameStateStore);
        const free_letters_on_board = GSS.letters.filter(e=>e.board && e.free);
        const evaluation = evaluateBoard(free_letters_on_board);
        GameStateStore.setEvaluation(evaluation);
    };

    const askForWordSubmission = (id) => {
        const GSS = get_store_value(GameStateStore);
        const free_letters_on_board = GSS.letters.filter(e=>e.board && e.free);
        onWordSubmission(id, free_letters_on_board);
    };

    const gameOver = () => {
        GameStateStore.setGameOver();
    };

    let rack = Array(7).fill(null);
    let rack_tmp;
    let current;

    const reset = () => {
        rack_tmp = [...rack];
        computeTranslate();
    };
    const get = () => {
        return rack_tmp.map((e, i)=>{return e ? {id: e.id, index: i} : undefined}).filter(e=>e)
    };
    const init = (rack_letters, grab_letter) => {
        const rack_container = document.querySelector(".rack-letters");
        const game_container = document.querySelector(".game");
        current = {...grab_letter}; // makes a deep copy
        current.dom = game_container.querySelector(`div[cui=\"${grab_letter.id}\"]`);
        rack = Array(7).fill(null);
        rack_letters.filter(e=>e.id!==grab_letter.id).map(e=>{
            let l = {...e}; // makes a deep copy
            l.dom = rack_container.querySelector(`div[cui=\"${l.id}\"]`);
            rack[l.index] = l;
            return e
        });
        rack_tmp = [...rack];

        // console.log(rack)
        // console.log(rack_tmp)
        // console.log(current)
    };

    const update  = (index) => {
        if (index !== undefined) {
            moveLetters(index, whereShouldItMove(index));
            computeTranslate();
        }
    };

    const whereShouldItMove = (index) => {
        if (rack_tmp[index]) {
            let k = 1;
            while ((index - k) >= 0 || (index + k) < 7) {
                // look left
                if ((index - k) >= 0) {
                    if (rack_tmp[index - k] === null) {
                        return {left: true, k: k}
                    }
                }
                // look right
                if ((index + k) < 7) {
                    if (rack_tmp[index + k] === null) {
                        return {left: false, k: k}
                    }
                }
                if (k > 100) {
                    console.log("inifinit loop");
                    return null
                }
                k += 1;
            }
            return null
        }
        return {left: true, k: 0}
    };

    const moveLetters = (from, movement) => {
        let start, end;
        if (movement.left) {
            start = from - movement.k + 1;
            end = from + 1;
            const tmp = rack_tmp.slice(start, end);
            rack_tmp = [...rack_tmp.slice(0, start -1), ...tmp, ...rack_tmp.slice(start - 1, start),...rack_tmp.slice(end, 7)].flat();
        } else {
            start = from;
            end = from + movement.k; 
            const tmp = rack_tmp.slice(start, end);
            rack_tmp = [...rack_tmp.slice(0, start), ...rack_tmp.slice(end, end + 1), ...tmp, ,...rack_tmp.slice(end + 1, 7)].flat();
        }
    };

    const computeTranslate = () => {
        const d = rack.map((e, i)=>{
            for (let k = 0; k < 7; k++) {
                if (e===rack_tmp[i-k]) return -k
                if (e===rack_tmp[i+k]) return k
            }
        });
        d.map((e, i)=>{
            if (rack[i]) {
                rack[i].dom.style.transform = `translateX(${e * 105.5}%)`;
            }
        });
    };

    var RM = {init, update, reset, get};

    /* src\game\LetterLook.svelte generated by Svelte v3.38.2 */

    const file$8 = "src\\game\\LetterLook.svelte";

    function create_fragment$9(ctx) {
    	let div;
    	let span0;
    	let t0;
    	let t1;
    	let span1;
    	let t2_value = (/*value*/ ctx[2] === 0 ? "" : /*value*/ ctx[2]) + "";
    	let t2;
    	let div_class_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span0 = element("span");
    			t0 = text(/*letter*/ ctx[1]);
    			t1 = space();
    			span1 = element("span");
    			t2 = text(t2_value);
    			attr_dev(span0, "class", "value svelte-f8hqlu");
    			add_location(span0, file$8, 22, 4, 444);
    			attr_dev(span1, "class", "score svelte-f8hqlu");
    			add_location(span1, file$8, 25, 4, 501);
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty("letter " + /*classes*/ ctx[4]) + " svelte-f8hqlu"));
    			attr_dev(div, "style", /*styles*/ ctx[5]);
    			attr_dev(div, "cui", /*id*/ ctx[3]);
    			add_location(div, file$8, 14, 0, 281);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span0);
    			append_dev(span0, t0);
    			append_dev(div, t1);
    			append_dev(div, span1);
    			append_dev(span1, t2);
    			/*div_binding*/ ctx[8](div);

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						div,
    						"mousedown",
    						function () {
    							if (is_function(/*on_mousedown*/ ctx[6])) /*on_mousedown*/ ctx[6].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						div,
    						"touchstart",
    						function () {
    							if (is_function(/*on_mousedown*/ ctx[6])) /*on_mousedown*/ ctx[6].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(
    						div,
    						"click",
    						function () {
    							if (is_function(/*on_click*/ ctx[7])) /*on_click*/ ctx[7].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    			if (dirty & /*letter*/ 2) set_data_dev(t0, /*letter*/ ctx[1]);
    			if (dirty & /*value*/ 4 && t2_value !== (t2_value = (/*value*/ ctx[2] === 0 ? "" : /*value*/ ctx[2]) + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*classes*/ 16 && div_class_value !== (div_class_value = "" + (null_to_empty("letter " + /*classes*/ ctx[4]) + " svelte-f8hqlu"))) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*styles*/ 32) {
    				attr_dev(div, "style", /*styles*/ ctx[5]);
    			}

    			if (dirty & /*id*/ 8) {
    				attr_dev(div, "cui", /*id*/ ctx[3]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*div_binding*/ ctx[8](null);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("LetterLook", slots, []);
    	let { letter } = $$props;
    	let { value } = $$props;
    	let { id } = $$props;
    	let { classes } = $$props;
    	let { styles = "" } = $$props;
    	let { self = null } = $$props;
    	let { on_mousedown = null } = $$props;
    	let { on_click = null } = $$props;

    	const writable_props = [
    		"letter",
    		"value",
    		"id",
    		"classes",
    		"styles",
    		"self",
    		"on_mousedown",
    		"on_click"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<LetterLook> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			self = $$value;
    			$$invalidate(0, self);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("letter" in $$props) $$invalidate(1, letter = $$props.letter);
    		if ("value" in $$props) $$invalidate(2, value = $$props.value);
    		if ("id" in $$props) $$invalidate(3, id = $$props.id);
    		if ("classes" in $$props) $$invalidate(4, classes = $$props.classes);
    		if ("styles" in $$props) $$invalidate(5, styles = $$props.styles);
    		if ("self" in $$props) $$invalidate(0, self = $$props.self);
    		if ("on_mousedown" in $$props) $$invalidate(6, on_mousedown = $$props.on_mousedown);
    		if ("on_click" in $$props) $$invalidate(7, on_click = $$props.on_click);
    	};

    	$$self.$capture_state = () => ({
    		letter,
    		value,
    		id,
    		classes,
    		styles,
    		self,
    		on_mousedown,
    		on_click
    	});

    	$$self.$inject_state = $$props => {
    		if ("letter" in $$props) $$invalidate(1, letter = $$props.letter);
    		if ("value" in $$props) $$invalidate(2, value = $$props.value);
    		if ("id" in $$props) $$invalidate(3, id = $$props.id);
    		if ("classes" in $$props) $$invalidate(4, classes = $$props.classes);
    		if ("styles" in $$props) $$invalidate(5, styles = $$props.styles);
    		if ("self" in $$props) $$invalidate(0, self = $$props.self);
    		if ("on_mousedown" in $$props) $$invalidate(6, on_mousedown = $$props.on_mousedown);
    		if ("on_click" in $$props) $$invalidate(7, on_click = $$props.on_click);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [self, letter, value, id, classes, styles, on_mousedown, on_click, div_binding];
    }

    class LetterLook extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init$1(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			letter: 1,
    			value: 2,
    			id: 3,
    			classes: 4,
    			styles: 5,
    			self: 0,
    			on_mousedown: 6,
    			on_click: 7
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "LetterLook",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*letter*/ ctx[1] === undefined && !("letter" in props)) {
    			console.warn("<LetterLook> was created without expected prop 'letter'");
    		}

    		if (/*value*/ ctx[2] === undefined && !("value" in props)) {
    			console.warn("<LetterLook> was created without expected prop 'value'");
    		}

    		if (/*id*/ ctx[3] === undefined && !("id" in props)) {
    			console.warn("<LetterLook> was created without expected prop 'id'");
    		}

    		if (/*classes*/ ctx[4] === undefined && !("classes" in props)) {
    			console.warn("<LetterLook> was created without expected prop 'classes'");
    		}
    	}

    	get letter() {
    		throw new Error("<LetterLook>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set letter(value) {
    		throw new Error("<LetterLook>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<LetterLook>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<LetterLook>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get id() {
    		throw new Error("<LetterLook>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<LetterLook>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classes() {
    		throw new Error("<LetterLook>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classes(value) {
    		throw new Error("<LetterLook>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styles() {
    		throw new Error("<LetterLook>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styles(value) {
    		throw new Error("<LetterLook>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get self() {
    		throw new Error("<LetterLook>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set self(value) {
    		throw new Error("<LetterLook>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get on_mousedown() {
    		throw new Error("<LetterLook>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set on_mousedown(value) {
    		throw new Error("<LetterLook>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get on_click() {
    		throw new Error("<LetterLook>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set on_click(value) {
    		throw new Error("<LetterLook>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\game\Letter.svelte generated by Svelte v3.38.2 */

    function create_fragment$8(ctx) {
    	let letterlook;
    	let current;

    	letterlook = new LetterLook({
    			props: {
    				letter: /*is_joker*/ ctx[1]
    				? /*letter*/ ctx[0].joker
    				: /*letter*/ ctx[0].letter,
    				value: LETTERS[/*letter*/ ctx[0].letter].pts,
    				id: /*letter*/ ctx[0].id,
    				classes: /*classes*/ ctx[2],
    				styles: /*styles*/ ctx[4],
    				self: /*self*/ ctx[5],
    				on_mousedown: /*on_mouse_down_callback*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(letterlook.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(letterlook, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const letterlook_changes = {};

    			if (dirty & /*is_joker, letter*/ 3) letterlook_changes.letter = /*is_joker*/ ctx[1]
    			? /*letter*/ ctx[0].joker
    			: /*letter*/ ctx[0].letter;

    			if (dirty & /*letter*/ 1) letterlook_changes.value = LETTERS[/*letter*/ ctx[0].letter].pts;
    			if (dirty & /*letter*/ 1) letterlook_changes.id = /*letter*/ ctx[0].id;
    			if (dirty & /*classes*/ 4) letterlook_changes.classes = /*classes*/ ctx[2];
    			if (dirty & /*styles*/ 16) letterlook_changes.styles = /*styles*/ ctx[4];
    			if (dirty & /*on_mouse_down_callback*/ 8) letterlook_changes.on_mousedown = /*on_mouse_down_callback*/ ctx[3];
    			letterlook.$set(letterlook_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(letterlook.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(letterlook.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(letterlook, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let free;
    	let board;
    	let grab;
    	let is_joker;
    	let classes;
    	let on_mouse_down_callback;
    	let styles;
    	let $GameStateStore;
    	validate_store(GameStateStore, "GameStateStore");
    	component_subscribe($$self, GameStateStore, $$value => $$invalidate(12, $GameStateStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Letter", slots, []);
    	let { game } = $$props;
    	let { letter } = $$props;
    	let location;
    	let grab_position = { x: null, y: null };
    	let self;

    	const handleEvent = e => {
    		if (e.touches) {
    			e.preventDefault();
    			document.body.style.overflow = "hidden";
    			return e.touches[0];
    		} else {
    			return e;
    		}
    	};

    	const dragStart = e => {
    		let E = handleEvent(e);
    		window.addEventListener("mousemove", dragMove);
    		window.addEventListener("touchmove", dragMove, { passive: false });
    		window.addEventListener("mouseup", dragEnd);
    		window.addEventListener("touchend", dragEnd);
    		$$invalidate(10, grab = true);
    		$$invalidate(7, grab_position = game.getXY(E));
    		location = game.getLocation(E);
    		RM.init($GameStateStore.letters.filter(e => !e.board), $GameStateStore.letters.filter(e => e.id === letter.id)[0]);
    	};

    	const dragMove = e => {
    		if (grab) {
    			let E = handleEvent(e);
    			$$invalidate(7, grab_position = game.getXY(E));
    			location = game.getLocation(E);

    			if (!location.board && location.index !== undefined) {
    				RM.update(location.index);
    			} else {
    				RM.reset();
    			}
    		}
    	};

    	const dragEnd = e => {
    		document.body.style.overflow = "auto";
    		e.preventDefault();
    		window.removeEventListener("mousemove", dragMove);
    		window.removeEventListener("touchmove", dragMove);
    		window.removeEventListener("mouseup", dragEnd);
    		window.removeEventListener("touchend", dragEnd);

    		if (!location.board && location.index !== undefined) {
    			// if dropped on rack
    			// update the rack letters' positions
    			const new_rack_location = RM.get();

    			new_rack_location.map(e => {
    				GameStateStore.moveLetter(e.id, false, e.index);
    			});
    		}

    		if (location.index !== undefined) {
    			// if dropped location is valid
    			if (is_joker) {
    				// if the letter is a joker
    				if (location.board && $GameStateStore.letters.filter(e => e.id === letter.id)[0].joker === "") {
    					// if dropped on board and has no joker letter
    					GameStateStore.setJokerPicker(letter, true); // activate joker picker
    				} else if (!location.board) {
    					// if dropped on rack
    					GameStateStore.setJoker(letter.id, ""); // unset the joker letter
    				}
    			}

    			// in all valid cases, update the letter location
    			GameStateStore.moveLetter(letter.id, location.board, location.index);

    			// and ask for a new board ask for a new board evaluation
    			askBoardEvaluation();
    		}

    		$$invalidate(10, grab = false);
    	};

    	const writable_props = ["game", "letter"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Letter> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("game" in $$props) $$invalidate(6, game = $$props.game);
    		if ("letter" in $$props) $$invalidate(0, letter = $$props.letter);
    	};

    	$$self.$capture_state = () => ({
    		LETTERS,
    		askBoardEvaluation,
    		GameStateStore,
    		RM,
    		LetterLook,
    		game,
    		letter,
    		location,
    		grab_position,
    		self,
    		handleEvent,
    		dragStart,
    		dragMove,
    		dragEnd,
    		free,
    		board,
    		grab,
    		is_joker,
    		$GameStateStore,
    		classes,
    		on_mouse_down_callback,
    		styles
    	});

    	$$self.$inject_state = $$props => {
    		if ("game" in $$props) $$invalidate(6, game = $$props.game);
    		if ("letter" in $$props) $$invalidate(0, letter = $$props.letter);
    		if ("location" in $$props) location = $$props.location;
    		if ("grab_position" in $$props) $$invalidate(7, grab_position = $$props.grab_position);
    		if ("self" in $$props) $$invalidate(5, self = $$props.self);
    		if ("free" in $$props) $$invalidate(8, free = $$props.free);
    		if ("board" in $$props) $$invalidate(9, board = $$props.board);
    		if ("grab" in $$props) $$invalidate(10, grab = $$props.grab);
    		if ("is_joker" in $$props) $$invalidate(1, is_joker = $$props.is_joker);
    		if ("classes" in $$props) $$invalidate(2, classes = $$props.classes);
    		if ("on_mouse_down_callback" in $$props) $$invalidate(3, on_mouse_down_callback = $$props.on_mouse_down_callback);
    		if ("styles" in $$props) $$invalidate(4, styles = $$props.styles);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*letter*/ 1) {
    			$$invalidate(8, free = letter.free);
    		}

    		if ($$self.$$.dirty & /*letter*/ 1) {
    			$$invalidate(9, board = letter.board);
    		}

    		if ($$self.$$.dirty & /*letter*/ 1) {
    			$$invalidate(1, is_joker = letter.letter === "_");
    		}

    		if ($$self.$$.dirty & /*grab, board, free, is_joker*/ 1794) {
    			$$invalidate(2, classes = (grab ? " grab" : "") + (!board ? " rack" : " board") + (free ? " free" : "") + (is_joker ? " isjoker" : ""));
    		}

    		if ($$self.$$.dirty & /*free, grab*/ 1280) {
    			$$invalidate(3, on_mouse_down_callback = free && !grab ? dragStart : null);
    		}

    		if ($$self.$$.dirty & /*grab_position*/ 128) {
    			$$invalidate(4, styles = `--x:${grab_position.x}px; --y:${grab_position.y}px;`);
    		}

    		if ($$self.$$.dirty & /*grab, grab_position, board, game, letter*/ 1729) {
    			{
    				if (grab) {
    					$$invalidate(4, styles = `--x:${grab_position.x}px; --y:${grab_position.y}px;`);
    				} else {
    					if (board) {
    						$$invalidate(4, styles = `--x:${game.getBoardXY(letter.index).x}; --y:${game.getBoardXY(letter.index).y};`);
    					} else {
    						$$invalidate(4, styles = `--pos:${game.getRackPos(letter.index)};`);
    					}
    				}
    			}
    		}
    	};

    	$$invalidate(10, grab = false);

    	return [
    		letter,
    		is_joker,
    		classes,
    		on_mouse_down_callback,
    		styles,
    		self,
    		game,
    		grab_position,
    		free,
    		board,
    		grab
    	];
    }

    class Letter extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$8, create_fragment$8, safe_not_equal, { game: 6, letter: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Letter",
    			options,
    			id: create_fragment$8.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*game*/ ctx[6] === undefined && !("game" in props)) {
    			console.warn("<Letter> was created without expected prop 'game'");
    		}

    		if (/*letter*/ ctx[0] === undefined && !("letter" in props)) {
    			console.warn("<Letter> was created without expected prop 'letter'");
    		}
    	}

    	get game() {
    		throw new Error("<Letter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set game(value) {
    		throw new Error("<Letter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get letter() {
    		throw new Error("<Letter>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set letter(value) {
    		throw new Error("<Letter>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\game\Joker.svelte generated by Svelte v3.38.2 */

    const { Object: Object_1$2 } = globals;
    const file$7 = "src\\game\\Joker.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	child_ctx[12] = i;
    	return child_ctx;
    }

    // (31:8) {#each letters as letter, i}
    function create_each_block$3(ctx) {
    	let letterlook;
    	let current;

    	function func() {
    		return /*func*/ ctx[5](/*i*/ ctx[12]);
    	}

    	letterlook = new LetterLook({
    			props: {
    				letter: /*letter*/ ctx[10],
    				value: "",
    				id: /*i*/ ctx[12],
    				classes: /*selected*/ ctx[2][/*i*/ ctx[12]]
    				? "joker selected"
    				: "joker",
    				on_click: func
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(letterlook.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(letterlook, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const letterlook_changes = {};

    			if (dirty & /*selected*/ 4) letterlook_changes.classes = /*selected*/ ctx[2][/*i*/ ctx[12]]
    			? "joker selected"
    			: "joker";

    			letterlook.$set(letterlook_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(letterlook.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(letterlook.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(letterlook, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(31:8) {#each letters as letter, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div0;
    	let t0;
    	let div4;
    	let div1;
    	let t2;
    	let div2;
    	let t3;
    	let div3;
    	let button0;
    	let t5;
    	let button1;
    	let t6;
    	let button1_disabled_value;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*letters*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = space();
    			div4 = element("div");
    			div1 = element("div");
    			div1.textContent = "Selectionne la lettre que tu souhaites attribuer à ton joker:";
    			t2 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t3 = space();
    			div3 = element("div");
    			button0 = element("button");
    			button0.textContent = "Annuler";
    			t5 = space();
    			button1 = element("button");
    			t6 = text("Valider");
    			attr_dev(div0, "class", "overlay svelte-f5oka9");
    			add_location(div0, file$7, 22, 0, 481);
    			attr_dev(div1, "class", "description svelte-f5oka9");
    			add_location(div1, file$7, 26, 4, 543);
    			attr_dev(div2, "class", "letters svelte-f5oka9");
    			add_location(div2, file$7, 29, 4, 657);
    			attr_dev(button0, "class", "svelte-f5oka9");
    			add_location(button0, file$7, 41, 8, 1000);
    			button1.disabled = button1_disabled_value = /*selected*/ ctx[2].indexOf(true) === -1;
    			attr_dev(button1, "class", "svelte-f5oka9");
    			add_location(button1, file$7, 44, 8, 1076);
    			attr_dev(div3, "class", "actions svelte-f5oka9");
    			add_location(div3, file$7, 40, 4, 969);
    			attr_dev(div4, "class", "container svelte-f5oka9");
    			add_location(div4, file$7, 25, 0, 514);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div1);
    			append_dev(div4, t2);
    			append_dev(div4, div2);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			append_dev(div4, t3);
    			append_dev(div4, div3);
    			append_dev(div3, button0);
    			append_dev(div3, t5);
    			append_dev(div3, button1);
    			append_dev(button1, t6);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(
    						button0,
    						"click",
    						function () {
    							if (is_function(/*cancel*/ ctx[0])) /*cancel*/ ctx[0].apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					),
    					listen_dev(button1, "click", /*click_handler*/ ctx[6], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*letters, selected, selectLetter*/ 28) {
    				each_value = /*letters*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div2, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (!current || dirty & /*selected*/ 4 && button1_disabled_value !== (button1_disabled_value = /*selected*/ ctx[2].indexOf(true) === -1)) {
    				prop_dev(button1, "disabled", button1_disabled_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div4);
    			destroy_each(each_blocks, detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let selected;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Joker", slots, []);
    	let { cancel } = $$props;
    	let { validate } = $$props;
    	const letters = Object.keys(LETTERS).filter(e => e !== "_");
    	let self;
    	let styles = "";
    	let classes = "joker";

    	const selectLetter = i => {
    		$$invalidate(2, selected = Array(letters.length).fill(false));
    		$$invalidate(2, selected[i] = true, selected);
    	};

    	const writable_props = ["cancel", "validate"];

    	Object_1$2.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Joker> was created with unknown prop '${key}'`);
    	});

    	const func = i => selectLetter(i);
    	const click_handler = () => validate(letters[selected.indexOf(true)]);

    	$$self.$$set = $$props => {
    		if ("cancel" in $$props) $$invalidate(0, cancel = $$props.cancel);
    		if ("validate" in $$props) $$invalidate(1, validate = $$props.validate);
    	};

    	$$self.$capture_state = () => ({
    		LETTERS,
    		LetterLook,
    		cancel,
    		validate,
    		letters,
    		self,
    		styles,
    		classes,
    		selectLetter,
    		selected
    	});

    	$$self.$inject_state = $$props => {
    		if ("cancel" in $$props) $$invalidate(0, cancel = $$props.cancel);
    		if ("validate" in $$props) $$invalidate(1, validate = $$props.validate);
    		if ("self" in $$props) self = $$props.self;
    		if ("styles" in $$props) styles = $$props.styles;
    		if ("classes" in $$props) classes = $$props.classes;
    		if ("selected" in $$props) $$invalidate(2, selected = $$props.selected);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$invalidate(2, selected = Array(letters.length).fill(false));
    	return [cancel, validate, selected, letters, selectLetter, func, click_handler];
    }

    class Joker extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$7, create_fragment$7, safe_not_equal, { cancel: 0, validate: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Joker",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*cancel*/ ctx[0] === undefined && !("cancel" in props)) {
    			console.warn("<Joker> was created without expected prop 'cancel'");
    		}

    		if (/*validate*/ ctx[1] === undefined && !("validate" in props)) {
    			console.warn("<Joker> was created without expected prop 'validate'");
    		}
    	}

    	get cancel() {
    		throw new Error("<Joker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set cancel(value) {
    		throw new Error("<Joker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get validate() {
    		throw new Error("<Joker>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set validate(value) {
    		throw new Error("<Joker>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\game\BoardOverlay.svelte generated by Svelte v3.38.2 */

    const { Object: Object_1$1 } = globals;
    const file$6 = "src\\game\\BoardOverlay.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	child_ctx[13] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[14] = list[i];
    	child_ctx[13] = i;
    	return child_ctx;
    }

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[16] = list[i];
    	child_ctx[13] = i;
    	return child_ctx;
    }

    // (66:4) {#if score_info.valid}
    function create_if_block_2$1(ctx) {
    	let div;
    	let span;
    	let t_value = /*score_info*/ ctx[3].score + "";
    	let t;
    	let div_class_value;
    	let div_style_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file$6, 67, 12, 2265);

    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(/*score_info*/ ctx[3].vertical
    			? "score vertical"
    			: "score") + " svelte-1mcix80"));

    			attr_dev(div, "style", div_style_value = `--x:${/*score_info*/ ctx[3].score_location.x}; --y:${/*score_info*/ ctx[3].score_location.y}`);
    			add_location(div, file$6, 66, 8, 2108);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*score_info*/ 8 && t_value !== (t_value = /*score_info*/ ctx[3].score + "")) set_data_dev(t, t_value);

    			if (dirty & /*score_info*/ 8 && div_class_value !== (div_class_value = "" + (null_to_empty(/*score_info*/ ctx[3].vertical
    			? "score vertical"
    			: "score") + " svelte-1mcix80"))) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*score_info*/ 8 && div_style_value !== (div_style_value = `--x:${/*score_info*/ ctx[3].score_location.x}; --y:${/*score_info*/ ctx[3].score_location.y}`)) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(66:4) {#if score_info.valid}",
    		ctx
    	});

    	return block;
    }

    // (73:4) {#if game_over}
    function create_if_block_1$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Partie terminé";
    			attr_dev(div, "class", "gameover svelte-1mcix80");
    			add_location(div, file$6, 73, 8, 2386);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(73:4) {#if game_over}",
    		ctx
    	});

    	return block;
    }

    // (80:0) {#if $GameStateStore.jocker_picker}
    function create_if_block$4(ctx) {
    	let joker;
    	let current;

    	joker = new Joker({
    			props: {
    				cancel: /*cancelJoker*/ ctx[5],
    				validate: /*validateJoker*/ ctx[6]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(joker.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(joker, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(joker.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(joker.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(joker, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(80:0) {#if $GameStateStore.jocker_picker}",
    		ctx
    	});

    	return block;
    }

    // (84:0) {#each temp_letters as ltr, i}
    function create_each_block_2$1(ctx) {
    	let letterlook;
    	let current;

    	letterlook = new LetterLook({
    			props: {
    				letter: /*ltr*/ ctx[16].letter,
    				value: "",
    				id: /*i*/ ctx[13],
    				classes: "board temp",
    				styles: `--x:${/*game*/ ctx[0].getBoardXY(/*ltr*/ ctx[16].index).x}; --y:${/*game*/ ctx[0].getBoardXY(/*ltr*/ ctx[16].index).y};`
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(letterlook.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(letterlook, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const letterlook_changes = {};
    			if (dirty & /*temp_letters*/ 16) letterlook_changes.letter = /*ltr*/ ctx[16].letter;
    			if (dirty & /*game, temp_letters*/ 17) letterlook_changes.styles = `--x:${/*game*/ ctx[0].getBoardXY(/*ltr*/ ctx[16].index).x}; --y:${/*game*/ ctx[0].getBoardXY(/*ltr*/ ctx[16].index).y};`;
    			letterlook.$set(letterlook_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(letterlook.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(letterlook.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(letterlook, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2$1.name,
    		type: "each",
    		source: "(84:0) {#each temp_letters as ltr, i}",
    		ctx
    	});

    	return block;
    }

    // (94:0) {#each row_names as rn, i}
    function create_each_block_1$1(ctx) {
    	let div;
    	let t_value = /*rn*/ ctx[14] + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "row-col-name svelte-1mcix80");
    			attr_dev(div, "style", `--x:${-1.125}; --y:${/*i*/ ctx[13] + 0.25};text-align: right;`);
    			add_location(div, file$6, 94, 5, 2876);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1$1.name,
    		type: "each",
    		source: "(94:0) {#each row_names as rn, i}",
    		ctx
    	});

    	return block;
    }

    // (99:0) {#each col_names as cn, i}
    function create_each_block$2(ctx) {
    	let div;
    	let t0_value = /*cn*/ ctx[11] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(div, "class", "row-col-name svelte-1mcix80");
    			attr_dev(div, "style", `--x:${/*i*/ ctx[13]}; --y:${-0.5};text-align: center;`);
    			add_location(div, file$6, 99, 5, 3032);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t0);
    			append_dev(div, t1);
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(99:0) {#each col_names as cn, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let each2_anchor;
    	let current;
    	let if_block0 = /*score_info*/ ctx[3].valid && create_if_block_2$1(ctx);
    	let if_block1 = /*game_over*/ ctx[2] && create_if_block_1$2(ctx);
    	let if_block2 = /*$GameStateStore*/ ctx[1].jocker_picker && create_if_block$4(ctx);
    	let each_value_2 = /*temp_letters*/ ctx[4];
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
    	}

    	const out = i => transition_out(each_blocks_2[i], 1, 1, () => {
    		each_blocks_2[i] = null;
    	});

    	let each_value_1 = /*row_names*/ ctx[7];
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
    	}

    	let each_value = /*col_names*/ ctx[8];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block0) if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			t2 = space();

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t3 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t4 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each2_anchor = empty();
    			attr_dev(div, "class", "overlay svelte-1mcix80");
    			add_location(div, file$6, 64, 0, 2048);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block0) if_block0.m(div, null);
    			append_dev(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			insert_dev(target, t1, anchor);
    			if (if_block2) if_block2.m(target, anchor);
    			insert_dev(target, t2, anchor);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(target, anchor);
    			}

    			insert_dev(target, t3, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(target, anchor);
    			}

    			insert_dev(target, t4, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each2_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*score_info*/ ctx[3].valid) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2$1(ctx);
    					if_block0.c();
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*game_over*/ ctx[2]) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_1$2(ctx);
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*$GameStateStore*/ ctx[1].jocker_picker) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*$GameStateStore*/ 2) {
    						transition_in(if_block2, 1);
    					}
    				} else {
    					if_block2 = create_if_block$4(ctx);
    					if_block2.c();
    					transition_in(if_block2, 1);
    					if_block2.m(t2.parentNode, t2);
    				}
    			} else if (if_block2) {
    				group_outros();

    				transition_out(if_block2, 1, 1, () => {
    					if_block2 = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*temp_letters, game*/ 17) {
    				each_value_2 = /*temp_letters*/ ctx[4];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2$1(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    						transition_in(each_blocks_2[i], 1);
    					} else {
    						each_blocks_2[i] = create_each_block_2$1(child_ctx);
    						each_blocks_2[i].c();
    						transition_in(each_blocks_2[i], 1);
    						each_blocks_2[i].m(t3.parentNode, t3);
    					}
    				}

    				group_outros();

    				for (i = each_value_2.length; i < each_blocks_2.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*row_names*/ 128) {
    				each_value_1 = /*row_names*/ ctx[7];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_1$1(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(t4.parentNode, t4);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_1.length;
    			}

    			if (dirty & /*col_names*/ 256) {
    				each_value = /*col_names*/ ctx[8];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each2_anchor.parentNode, each2_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block2);

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks_2[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block2);
    			each_blocks_2 = each_blocks_2.filter(Boolean);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				transition_out(each_blocks_2[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block0) if_block0.d();
    			if (if_block1) if_block1.d();
    			if (detaching) detach_dev(t1);
    			if (if_block2) if_block2.d(detaching);
    			if (detaching) detach_dev(t2);
    			destroy_each(each_blocks_2, detaching);
    			if (detaching) detach_dev(t3);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t4);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each2_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let score_info;
    	let temp_letters;
    	let $GameStateStore;
    	let $GameGimmickStore;
    	validate_store(GameStateStore, "GameStateStore");
    	component_subscribe($$self, GameStateStore, $$value => $$invalidate(1, $GameStateStore = $$value));
    	validate_store(GameGimmickStore, "GameGimmickStore");
    	component_subscribe($$self, GameGimmickStore, $$value => $$invalidate(9, $GameGimmickStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("BoardOverlay", slots, []);
    	let { game } = $$props;

    	// dealing with score update
    	const score_info_default = { valid: false, score: 0, vertical: false };

    	// dealing with joker picker
    	// $: joker_picker = $GameStateStore.jocker_picker
    	const cancelJoker = () => {
    		let letter = $GameStateStore.jocker_picker_letter;
    		GameStateStore.moveLetter(letter.id, letter.board, letter.index);
    		GameStateStore.setJokerPicker({}, false);
    		askBoardEvaluation();
    	};

    	const validateJoker = ltr => {
    		let letter = $GameStateStore.jocker_picker_letter;
    		GameStateStore.setJoker(letter.id, ltr);
    		GameStateStore.setJokerPicker({}, false);
    		askBoardEvaluation();
    	};

    	// dealing with row and column names
    	const row_names = Array(15).fill(0).map((e, i) => i + 1);

    	const col_names = Object.keys(LETTERS).filter(e => e !== "_").filter((e, i) => i < 15);

    	// dealing with game overlay
    	let game_over = false;

    	const writable_props = ["game"];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<BoardOverlay> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("game" in $$props) $$invalidate(0, game = $$props.game);
    	};

    	$$self.$capture_state = () => ({
    		LETTERS,
    		GameStateStore,
    		GameGimmickStore,
    		Joker,
    		askBoardEvaluation,
    		LetterLook,
    		game,
    		score_info_default,
    		cancelJoker,
    		validateJoker,
    		row_names,
    		col_names,
    		game_over,
    		score_info,
    		$GameStateStore,
    		temp_letters,
    		$GameGimmickStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("game" in $$props) $$invalidate(0, game = $$props.game);
    		if ("game_over" in $$props) $$invalidate(2, game_over = $$props.game_over);
    		if ("score_info" in $$props) $$invalidate(3, score_info = $$props.score_info);
    		if ("temp_letters" in $$props) $$invalidate(4, temp_letters = $$props.temp_letters);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$GameStateStore, game*/ 3) {
    			{
    				let evaluation = $GameStateStore.evaluation;

    				if (evaluation) {
    					$$invalidate(3, score_info = {
    						valid: evaluation.is_word_valid,
    						score: evaluation.total_score,
    						score_location: game.getBoardXY(evaluation.last_letter_index),
    						vertical: evaluation.full_words[evaluation.main_word_index].vertical
    					});
    				} else {
    					$$invalidate(3, score_info = { ...score_info_default });
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*$GameGimmickStore*/ 512) {
    			{
    				$$invalidate(4, temp_letters = $GameGimmickStore.temp_letters);
    			}
    		}

    		if ($$self.$$.dirty & /*$GameStateStore*/ 2) {
    			{
    				$$invalidate(2, game_over = $GameStateStore.game_over);
    			}
    		}
    	};

    	$$invalidate(3, score_info = { ...score_info_default });

    	// dealing with temp letters
    	$$invalidate(4, temp_letters = []);

    	return [
    		game,
    		$GameStateStore,
    		game_over,
    		score_info,
    		temp_letters,
    		cancelJoker,
    		validateJoker,
    		row_names,
    		col_names,
    		$GameGimmickStore
    	];
    }

    class BoardOverlay extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$6, create_fragment$6, safe_not_equal, { game: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BoardOverlay",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*game*/ ctx[0] === undefined && !("game" in props)) {
    			console.warn("<BoardOverlay> was created without expected prop 'game'");
    		}
    	}

    	get game() {
    		throw new Error("<BoardOverlay>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set game(value) {
    		throw new Error("<BoardOverlay>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\game\Game.svelte generated by Svelte v3.38.2 */
    const file$5 = "src\\game\\Game.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	return child_ctx;
    }

    function get_each_context_3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[24] = list[i];
    	child_ctx[25] = list;
    	child_ctx[26] = i;
    	return child_ctx;
    }

    function get_each_context_4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[24] = list[i];
    	child_ctx[27] = list;
    	child_ctx[26] = i;
    	return child_ctx;
    }

    // (79:12) {#each board as e, i}
    function create_each_block_4(ctx) {
    	let div;
    	let each_value_4 = /*each_value_4*/ ctx[27];
    	let i = /*i*/ ctx[26];
    	const assign_div = () => /*div_binding*/ ctx[9](div, each_value_4, i);
    	const unassign_div = () => /*div_binding*/ ctx[9](null, each_value_4, i);

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "board-cell svelte-d5xu96");
    			attr_dev(div, "style", `--x:${/*getBoardXY*/ ctx[6](/*i*/ ctx[26]).x};--y:${/*getBoardXY*/ ctx[6](/*i*/ ctx[26]).y};`);
    			attr_dev(div, "cid", /*i*/ ctx[26]);
    			add_location(div, file$5, 79, 16, 2528);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			assign_div();
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (each_value_4 !== /*each_value_4*/ ctx[27] || i !== /*i*/ ctx[26]) {
    				unassign_div();
    				each_value_4 = /*each_value_4*/ ctx[27];
    				i = /*i*/ ctx[26];
    				assign_div();
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			unassign_div();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_4.name,
    		type: "each",
    		source: "(79:12) {#each board as e, i}",
    		ctx
    	});

    	return block;
    }

    // (86:12) {#each rack as e, i}
    function create_each_block_3(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let each_value_3 = /*each_value_3*/ ctx[25];
    	let i = /*i*/ ctx[26];
    	const assign_div1 = () => /*div1_binding*/ ctx[10](div1, each_value_3, i);
    	const unassign_div1 = () => /*div1_binding*/ ctx[10](null, each_value_3, i);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t = space();
    			attr_dev(div0, "class", "rack-decoration svelte-d5xu96");
    			add_location(div0, file$5, 87, 16, 2938);
    			attr_dev(div1, "class", "rack-cell svelte-d5xu96");
    			attr_dev(div1, "style", `--pos:${/*getRackPos*/ ctx[7](/*i*/ ctx[26])};`);
    			attr_dev(div1, "cid", /*i*/ ctx[26]);
    			add_location(div1, file$5, 86, 12, 2840);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t);
    			assign_div1();
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (each_value_3 !== /*each_value_3*/ ctx[25] || i !== /*i*/ ctx[26]) {
    				unassign_div1();
    				each_value_3 = /*each_value_3*/ ctx[25];
    				i = /*i*/ ctx[26];
    				assign_div1();
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			unassign_div1();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_3.name,
    		type: "each",
    		source: "(86:12) {#each rack as e, i}",
    		ctx
    	});

    	return block;
    }

    // (94:8) {#if $GameStateStore}
    function create_if_block$3(ctx) {
    	let div0;
    	let t0;
    	let div1;
    	let t1;
    	let div2;
    	let current;
    	let each_value_2 = /*$GameStateStore*/ ctx[5].letters.filter(func);
    	validate_each_argument(each_value_2);
    	let each_blocks_2 = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks_2[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const out = i => transition_out(each_blocks_2[i], 1, 1, () => {
    		each_blocks_2[i] = null;
    	});

    	let each_value_1 = /*$GameStateStore*/ ctx[5].letters.filter(func_1);
    	validate_each_argument(each_value_1);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const out_1 = i => transition_out(each_blocks_1[i], 1, 1, () => {
    		each_blocks_1[i] = null;
    	});

    	let each_value = /*$GameStateStore*/ ctx[5].letters.filter(func_2);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out_2 = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div0 = element("div");

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].c();
    			}

    			t0 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t1 = space();
    			div2 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "board-letters-free");
    			add_location(div0, file$5, 94, 12, 3095);
    			attr_dev(div1, "class", "board-letters-fixed");
    			add_location(div1, file$5, 99, 12, 3340);
    			attr_dev(div2, "class", "rack-letters");
    			add_location(div2, file$5, 104, 12, 3587);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				each_blocks_2[i].m(div0, null);
    			}

    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div1, null);
    			}

    			insert_dev(target, t1, anchor);
    			insert_dev(target, div2, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div2, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*locationFunctions, $GameStateStore*/ 288) {
    				each_value_2 = /*$GameStateStore*/ ctx[5].letters.filter(func);
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks_2[i]) {
    						each_blocks_2[i].p(child_ctx, dirty);
    						transition_in(each_blocks_2[i], 1);
    					} else {
    						each_blocks_2[i] = create_each_block_2(child_ctx);
    						each_blocks_2[i].c();
    						transition_in(each_blocks_2[i], 1);
    						each_blocks_2[i].m(div0, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_2.length; i < each_blocks_2.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*locationFunctions, $GameStateStore*/ 288) {
    				each_value_1 = /*$GameStateStore*/ ctx[5].letters.filter(func_1);
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    						transition_in(each_blocks_1[i], 1);
    					} else {
    						each_blocks_1[i] = create_each_block_1(child_ctx);
    						each_blocks_1[i].c();
    						transition_in(each_blocks_1[i], 1);
    						each_blocks_1[i].m(div1, null);
    					}
    				}

    				group_outros();

    				for (i = each_value_1.length; i < each_blocks_1.length; i += 1) {
    					out_1(i);
    				}

    				check_outros();
    			}

    			if (dirty & /*locationFunctions, $GameStateStore*/ 288) {
    				each_value = /*$GameStateStore*/ ctx[5].letters.filter(func_2);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div2, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out_2(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value_2.length; i += 1) {
    				transition_in(each_blocks_2[i]);
    			}

    			for (let i = 0; i < each_value_1.length; i += 1) {
    				transition_in(each_blocks_1[i]);
    			}

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks_2 = each_blocks_2.filter(Boolean);

    			for (let i = 0; i < each_blocks_2.length; i += 1) {
    				transition_out(each_blocks_2[i]);
    			}

    			each_blocks_1 = each_blocks_1.filter(Boolean);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				transition_out(each_blocks_1[i]);
    			}

    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			destroy_each(each_blocks_2, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks_1, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(94:8) {#if $GameStateStore}",
    		ctx
    	});

    	return block;
    }

    // (96:16) {#each $GameStateStore.letters.filter(e=>e.board && e.free) as ltr}
    function create_each_block_2(ctx) {
    	let letter;
    	let current;

    	letter = new Letter({
    			props: {
    				game: /*locationFunctions*/ ctx[8],
    				letter: /*ltr*/ ctx[17]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(letter.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(letter, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const letter_changes = {};
    			if (dirty & /*$GameStateStore*/ 32) letter_changes.letter = /*ltr*/ ctx[17];
    			letter.$set(letter_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(letter.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(letter.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(letter, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(96:16) {#each $GameStateStore.letters.filter(e=>e.board && e.free) as ltr}",
    		ctx
    	});

    	return block;
    }

    // (101:16) {#each $GameStateStore.letters.filter(e=>e.board && !e.free) as ltr}
    function create_each_block_1(ctx) {
    	let letter;
    	let current;

    	letter = new Letter({
    			props: {
    				game: /*locationFunctions*/ ctx[8],
    				letter: /*ltr*/ ctx[17]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(letter.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(letter, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const letter_changes = {};
    			if (dirty & /*$GameStateStore*/ 32) letter_changes.letter = /*ltr*/ ctx[17];
    			letter.$set(letter_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(letter.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(letter.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(letter, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(101:16) {#each $GameStateStore.letters.filter(e=>e.board && !e.free) as ltr}",
    		ctx
    	});

    	return block;
    }

    // (106:16) {#each $GameStateStore.letters.filter(e=>!e.board) as ltr}
    function create_each_block$1(ctx) {
    	let letter;
    	let current;

    	letter = new Letter({
    			props: {
    				game: /*locationFunctions*/ ctx[8],
    				letter: /*ltr*/ ctx[17]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(letter.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(letter, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const letter_changes = {};
    			if (dirty & /*$GameStateStore*/ 32) letter_changes.letter = /*ltr*/ ctx[17];
    			letter.$set(letter_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(letter.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(letter.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(letter, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(106:16) {#each $GameStateStore.letters.filter(e=>!e.board) as ltr}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div3;
    	let div2;
    	let div0;
    	let boardoverlay;
    	let t0;
    	let t1;
    	let div1;
    	let t2;
    	let div3_style_value;
    	let current;

    	boardoverlay = new BoardOverlay({
    			props: { game: /*locationFunctions*/ ctx[8] },
    			$$inline: true
    		});

    	let each_value_4 = /*board*/ ctx[3];
    	validate_each_argument(each_value_4);
    	let each_blocks_1 = [];

    	for (let i = 0; i < each_value_4.length; i += 1) {
    		each_blocks_1[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
    	}

    	let each_value_3 = /*rack*/ ctx[4];
    	validate_each_argument(each_value_3);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_3.length; i += 1) {
    		each_blocks[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
    	}

    	let if_block = /*$GameStateStore*/ ctx[5] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			create_component(boardoverlay.$$.fragment);
    			t0 = space();

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].c();
    			}

    			t1 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t2 = space();
    			if (if_block) if_block.c();
    			attr_dev(div0, "class", "board svelte-d5xu96");
    			add_location(div0, file$5, 76, 8, 2402);
    			attr_dev(div1, "class", "rack svelte-d5xu96");
    			add_location(div1, file$5, 84, 8, 2774);
    			attr_dev(div2, "class", "game svelte-d5xu96");
    			add_location(div2, file$5, 75, 4, 2357);
    			attr_dev(div3, "class", "container svelte-d5xu96");
    			attr_dev(div3, "style", div3_style_value = `--REF-SIZE: ${/*width*/ ctx[0] * 15 / 16}px;--S: ${/*width*/ ctx[0] / 16}px;`);
    			add_location(div3, file$5, 74, 0, 2247);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			mount_component(boardoverlay, div0, null);
    			append_dev(div0, t0);

    			for (let i = 0; i < each_blocks_1.length; i += 1) {
    				each_blocks_1[i].m(div0, null);
    			}

    			append_dev(div2, t1);
    			append_dev(div2, div1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}

    			append_dev(div2, t2);
    			if (if_block) if_block.m(div2, null);
    			/*div2_binding*/ ctx[11](div2);
    			/*div3_binding*/ ctx[12](div3);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*getBoardXY, board*/ 72) {
    				each_value_4 = /*board*/ ctx[3];
    				validate_each_argument(each_value_4);
    				let i;

    				for (i = 0; i < each_value_4.length; i += 1) {
    					const child_ctx = get_each_context_4(ctx, each_value_4, i);

    					if (each_blocks_1[i]) {
    						each_blocks_1[i].p(child_ctx, dirty);
    					} else {
    						each_blocks_1[i] = create_each_block_4(child_ctx);
    						each_blocks_1[i].c();
    						each_blocks_1[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks_1.length; i += 1) {
    					each_blocks_1[i].d(1);
    				}

    				each_blocks_1.length = each_value_4.length;
    			}

    			if (dirty & /*getRackPos, rack*/ 144) {
    				each_value_3 = /*rack*/ ctx[4];
    				validate_each_argument(each_value_3);
    				let i;

    				for (i = 0; i < each_value_3.length; i += 1) {
    					const child_ctx = get_each_context_3(ctx, each_value_3, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_3(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_3.length;
    			}

    			if (/*$GameStateStore*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*$GameStateStore*/ 32) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div2, null);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (!current || dirty & /*width*/ 1 && div3_style_value !== (div3_style_value = `--REF-SIZE: ${/*width*/ ctx[0] * 15 / 16}px;--S: ${/*width*/ ctx[0] / 16}px;`)) {
    				attr_dev(div3, "style", div3_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(boardoverlay.$$.fragment, local);
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(boardoverlay.$$.fragment, local);
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(boardoverlay);
    			destroy_each(each_blocks_1, detaching);
    			destroy_each(each_blocks, detaching);
    			if (if_block) if_block.d();
    			/*div2_binding*/ ctx[11](null);
    			/*div3_binding*/ ctx[12](null);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const BOARD_DIM = 15;
    const RACK_DIM = 7;
    const func = e => e.board && e.free;
    const func_1 = e => e.board && !e.free;
    const func_2 = e => !e.board;

    function instance$5($$self, $$props, $$invalidate) {
    	let $GameStateStore;
    	validate_store(GameStateStore, "GameStateStore");
    	component_subscribe($$self, GameStateStore, $$value => $$invalidate(5, $GameStateStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Game", slots, []);
    	let { width } = $$props;
    	let game, container;
    	let board = Array(BOARD_DIM * BOARD_DIM).fill(0);
    	let rack = Array(RACK_DIM).fill(0);

    	const getBoardXY = index => {
    		const x = Math.floor(index / BOARD_DIM);
    		const y = index - x * BOARD_DIM;
    		return { x, y };
    	};

    	const getRackPos = index => index;

    	const getXY = e => {
    		const curr_pos = { x: e.clientX, y: e.clientY };
    		const game_pos = game.getBoundingClientRect();

    		return {
    			x: curr_pos.x - game_pos.x,
    			y: curr_pos.y - game_pos.y
    		};
    	};

    	const isWithinRect = (refRect, pos) => {
    		return !(pos.x < refRect.x || pos.x > refRect.x + refRect.width || pos.y < refRect.y || pos.y > refRect.y + refRect.height);
    	};

    	const isWithinGame = pos => {
    		return isWithinRect(game.getBoundingClientRect(), pos);
    	};

    	const getLocation = e => {
    		const translateClientRect = (Rect, Ref) => {
    			Rect.x = Rect.x - Ref.x;
    			Rect.y = Rect.y - Ref.y;
    			return Rect;
    		};

    		const game_pos = game.getBoundingClientRect();
    		const position = getXY(e);

    		const getCID = arr => {
    			const e = arr.filter(e => {
    				const current_obj = translateClientRect(e.getBoundingClientRect(), game_pos);
    				return isWithinRect(current_obj, position);
    			})[0];

    			if (e) return parseInt(e.getAttribute("cid"));
    			return undefined;
    		};

    		const b = getCID(board);
    		const r = getCID(rack);

    		return {
    			board: b !== undefined,
    			index: b !== undefined ? b : r
    		};
    	};

    	const locationFunctions = {
    		getLocation,
    		getBoardXY,
    		getRackPos,
    		getXY,
    		isWithinRect,
    		isWithinGame
    	};

    	const writable_props = ["width"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Game> was created with unknown prop '${key}'`);
    	});

    	function div_binding($$value, each_value_4, i) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			each_value_4[i] = $$value;
    			$$invalidate(3, board);
    		});
    	}

    	function div1_binding($$value, each_value_3, i) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			each_value_3[i] = $$value;
    			$$invalidate(4, rack);
    		});
    	}

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			game = $$value;
    			$$invalidate(1, game);
    		});
    	}

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			container = $$value;
    			$$invalidate(2, container);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    	};

    	$$self.$capture_state = () => ({
    		GameStateStore,
    		askForNewGame,
    		Letter,
    		BoardOverlay,
    		width,
    		game,
    		container,
    		BOARD_DIM,
    		RACK_DIM,
    		board,
    		rack,
    		getBoardXY,
    		getRackPos,
    		getXY,
    		isWithinRect,
    		isWithinGame,
    		getLocation,
    		locationFunctions,
    		$GameStateStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("game" in $$props) $$invalidate(1, game = $$props.game);
    		if ("container" in $$props) $$invalidate(2, container = $$props.container);
    		if ("board" in $$props) $$invalidate(3, board = $$props.board);
    		if ("rack" in $$props) $$invalidate(4, rack = $$props.rack);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		width,
    		game,
    		container,
    		board,
    		rack,
    		$GameStateStore,
    		getBoardXY,
    		getRackPos,
    		locationFunctions,
    		div_binding,
    		div1_binding,
    		div2_binding,
    		div3_binding
    	];
    }

    class Game extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$5, create_fragment$5, safe_not_equal, { width: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Game",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*width*/ ctx[0] === undefined && !("width" in props)) {
    			console.warn("<Game> was created without expected prop 'width'");
    		}
    	}

    	get width() {
    		throw new Error("<Game>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set width(value) {
    		throw new Error("<Game>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\game\MasterMolangeur.svelte generated by Svelte v3.38.2 */

    const { Object: Object_1 } = globals;
    const file$4 = "src\\game\\MasterMolangeur.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	child_ctx[12] = i;
    	return child_ctx;
    }

    // (52:4) {#if !first_round}
    function create_if_block$2(ctx) {
    	let div0;
    	let t0_value = `Maître MoLangeur avait trouvé ${/*words_list*/ ctx[0].length} mots et positions valides: ` + "";
    	let t0;
    	let t1;
    	let div1;
    	let each_value = /*words_list*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "title");
    			add_location(div0, file$4, 52, 8, 1732);
    			attr_dev(div1, "class", "best-words-list svelte-vhdfrg");
    			add_location(div1, file$4, 55, 8, 1877);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, t0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*words_list*/ 1 && t0_value !== (t0_value = `Maître MoLangeur avait trouvé ${/*words_list*/ ctx[0].length} mots et positions valides: ` + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*selected, showWord, endShow, words_list, getNiceWordCoord*/ 59) {
    				each_value = /*words_list*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(52:4) {#if !first_round}",
    		ctx
    	});

    	return block;
    }

    // (68:20) {:else}
    function create_else_block$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "pos-h svelte-vhdfrg");
    			add_location(div, file$4, 68, 24, 2412);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(68:20) {:else}",
    		ctx
    	});

    	return block;
    }

    // (66:20) {#if word.dir==="V"}
    function create_if_block_1$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "pos-v svelte-vhdfrg");
    			add_location(div, file$4, 66, 24, 2332);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(66:20) {#if word.dir===\\\"V\\\"}",
    		ctx
    	});

    	return block;
    }

    // (57:12) {#each words_list as word, i}
    function create_each_block(ctx) {
    	let div;
    	let t0;
    	let span0;
    	let t1_value = /*getNiceWordCoord*/ ctx[3](/*word*/ ctx[10].index) + "";
    	let t1;
    	let t2;
    	let span1;
    	let t3_value = /*word*/ ctx[10].word + "";
    	let t3;
    	let t4;
    	let span2;
    	let t5_value = /*word*/ ctx[10].pts + " points" + "";
    	let t5;
    	let t6;
    	let div_selected_value;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*word*/ ctx[10].dir === "V") return create_if_block_1$1;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	function mouseover_handler() {
    		return /*mouseover_handler*/ ctx[7](/*i*/ ctx[12]);
    	}

    	function focus_handler() {
    		return /*focus_handler*/ ctx[8](/*i*/ ctx[12]);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			t0 = space();
    			span0 = element("span");
    			t1 = text(t1_value);
    			t2 = space();
    			span1 = element("span");
    			t3 = text(t3_value);
    			t4 = space();
    			span2 = element("span");
    			t5 = text(t5_value);
    			t6 = space();
    			attr_dev(span0, "class", "crd");
    			add_location(span0, file$4, 70, 20, 2486);
    			attr_dev(span1, "class", "wrd svelte-vhdfrg");
    			add_location(span1, file$4, 73, 20, 2611);
    			attr_dev(span2, "class", "pts svelte-vhdfrg");
    			add_location(span2, file$4, 76, 20, 2717);
    			attr_dev(div, "class", "word svelte-vhdfrg");
    			attr_dev(div, "tabindex", "0");
    			attr_dev(div, "selected", div_selected_value = /*i*/ ctx[12] === /*selected*/ ctx[1] ? "true" : "false");
    			add_location(div, file$4, 57, 16, 1967);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);
    			append_dev(div, t0);
    			append_dev(div, span0);
    			append_dev(span0, t1);
    			append_dev(div, t2);
    			append_dev(div, span1);
    			append_dev(span1, t3);
    			append_dev(div, t4);
    			append_dev(div, span2);
    			append_dev(span2, t5);
    			append_dev(div, t6);

    			if (!mounted) {
    				dispose = [
    					listen_dev(div, "mouseover", mouseover_handler, false, false, false),
    					listen_dev(div, "mouseout", /*endShow*/ ctx[5], false, false, false),
    					listen_dev(div, "focus", focus_handler, false, false, false),
    					listen_dev(div, "blur", /*endShow*/ ctx[5], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, t0);
    				}
    			}

    			if (dirty & /*words_list*/ 1 && t1_value !== (t1_value = /*getNiceWordCoord*/ ctx[3](/*word*/ ctx[10].index) + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*words_list*/ 1 && t3_value !== (t3_value = /*word*/ ctx[10].word + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*words_list*/ 1 && t5_value !== (t5_value = /*word*/ ctx[10].pts + " points" + "")) set_data_dev(t5, t5_value);

    			if (dirty & /*selected*/ 2 && div_selected_value !== (div_selected_value = /*i*/ ctx[12] === /*selected*/ ctx[1] ? "true" : "false")) {
    				attr_dev(div, "selected", div_selected_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(57:12) {#each words_list as word, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div;
    	let if_block = !/*first_round*/ ctx[2] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "container svelte-vhdfrg");
    			add_location(div, file$4, 50, 0, 1675);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (!/*first_round*/ ctx[2]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let words_list;
    	let selected;
    	let first_round;
    	let $GameStateStore;
    	validate_store(GameStateStore, "GameStateStore");
    	component_subscribe($$self, GameStateStore, $$value => $$invalidate(6, $GameStateStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("MasterMolangeur", slots, []);

    	const getNiceWordCoord = index => {
    		const row_names = Array(15).fill(0).map((e, i) => i + 1);
    		const col_names = Object.keys(LETTERS).filter(e => e !== "_").filter((e, i) => i < 15);
    		const coord = getRowColIndex(index);
    		return row_names[coord.row] + col_names[coord.col];
    	};

    	const getWordIndices = (index, n, vertical = true) => {
    		let coord = getRowColIndex(index);

    		let add = {
    			row: vertical ? 1 : 0,
    			col: vertical ? 0 : 1
    		};

    		return Array(n).fill(index).map((e, i) => {
    			return getIndexFromRowCol(coord.row + i * add.row, coord.col + i * add.col);
    		});
    	};

    	const showWord = i => {
    		const word = words_list[i];
    		const letters = word.word.split("");
    		const indices = getWordIndices(word.index, letters.length, word.dir === "V");

    		GameGimmickStore.setTempLetters(letters.map((e, i) => {
    			return { index: indices[i], letter: e };
    		}));

    		$$invalidate(1, selected = i);
    	};

    	const endShow = () => {
    		GameGimmickStore.setTempLetters([]);
    		$$invalidate(1, selected = -1);
    	};

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<MasterMolangeur> was created with unknown prop '${key}'`);
    	});

    	const mouseover_handler = i => showWord(i);
    	const focus_handler = i => showWord(i);

    	$$self.$capture_state = () => ({
    		GameStateStore,
    		GameGimmickStore,
    		LETTERS,
    		getIndexFromRowCol,
    		getRowColIndex,
    		getNiceWordCoord,
    		getWordIndices,
    		showWord,
    		endShow,
    		words_list,
    		$GameStateStore,
    		selected,
    		first_round
    	});

    	$$self.$inject_state = $$props => {
    		if ("words_list" in $$props) $$invalidate(0, words_list = $$props.words_list);
    		if ("selected" in $$props) $$invalidate(1, selected = $$props.selected);
    		if ("first_round" in $$props) $$invalidate(2, first_round = $$props.first_round);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$GameStateStore*/ 64) {
    			{
    				$$invalidate(0, words_list = $GameStateStore.molangeur.current_words);
    			} // console.log($GameStateStore.molangeur.next_words)
    		}

    		if ($$self.$$.dirty & /*$GameStateStore*/ 64) {
    			{
    				$$invalidate(2, first_round = $GameStateStore.round === 0);
    			}
    		}
    	};

    	$$invalidate(0, words_list = []);
    	$$invalidate(1, selected = -1);
    	$$invalidate(2, first_round = true);

    	return [
    		words_list,
    		selected,
    		first_round,
    		getNiceWordCoord,
    		showWord,
    		endShow,
    		$GameStateStore,
    		mouseover_handler,
    		focus_handler
    	];
    }

    class MasterMolangeur extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MasterMolangeur",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\game\Buttons.svelte generated by Svelte v3.38.2 */

    const file$3 = "src\\game\\Buttons.svelte";

    // (49:8) {:else}
    function create_else_block_1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Mot non valide";
    			attr_dev(div, "class", "result invalid svelte-57msys");
    			add_location(div, file$3, 49, 12, 1594);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(49:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (45:41) 
    function create_if_block_2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Mot valide";
    			attr_dev(div, "class", "result valid svelte-57msys");
    			add_location(div, file$3, 45, 12, 1489);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(45:41) ",
    		ctx
    	});

    	return block;
    }

    // (43:8) {#if dictionnary_valid_word===null }
    function create_if_block_1(ctx) {
    	let t_value = "" + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(43:8) {#if dictionnary_valid_word===null }",
    		ctx
    	});

    	return block;
    }

    // (61:4) {:else}
    function create_else_block$1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Jouer";
    			button.disabled = true;
    			attr_dev(button, "class", "svelte-57msys");
    			add_location(button, file$3, 61, 8, 1965);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*play*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(61:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (59:4) {#if word_submission_possible}
    function create_if_block$1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Jouer";
    			attr_dev(button, "class", "svelte-57msys");
    			add_location(button, file$3, 59, 8, 1904);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*play*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(59:4) {#if word_submission_possible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div1;
    	let div0;
    	let input;
    	let t0;
    	let t1;
    	let button0;
    	let t3;
    	let button1;
    	let t5;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*dictionnary_valid_word*/ ctx[0] === null) return create_if_block_1;
    		if (/*dictionnary_valid_word*/ ctx[0]) return create_if_block_2;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*word_submission_possible*/ ctx[1]) return create_if_block$1;
    		return create_else_block$1;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block1 = current_block_type_1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			input = element("input");
    			t0 = space();
    			if_block0.c();
    			t1 = space();
    			button0 = element("button");
    			button0.textContent = "Nouvelle partie";
    			t3 = space();
    			button1 = element("button");
    			button1.textContent = "Ramener les lettres";
    			t5 = space();
    			if_block1.c();
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "Dictionnaire");
    			attr_dev(input, "onkeypress", "return (event.key.length === 1 && /[A-Za-zéèëêîïûôâàç]/.test(event.key))");
    			attr_dev(input, "class", "svelte-57msys");
    			add_location(input, file$3, 41, 8, 1188);
    			attr_dev(div0, "class", "dico");
    			add_location(div0, file$3, 40, 4, 1160);
    			attr_dev(button0, "class", "svelte-57msys");
    			add_location(button0, file$3, 56, 4, 1723);
    			attr_dev(button1, "class", "svelte-57msys");
    			add_location(button1, file$3, 57, 4, 1786);
    			attr_dev(div1, "class", "action svelte-57msys");
    			add_location(div1, file$3, 39, 0, 1133);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, input);
    			set_input_value(input, /*word_to_check*/ ctx[2]);
    			append_dev(div0, t0);
    			if_block0.m(div0, null);
    			append_dev(div1, t1);
    			append_dev(div1, button0);
    			append_dev(div1, t3);
    			append_dev(div1, button1);
    			append_dev(div1, t5);
    			if_block1.m(div1, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[6]),
    					listen_dev(input, "keyup", /*checkWord*/ ctx[3], false, false, false),
    					listen_dev(button0, "click", askForNewGame, false, false, false),
    					listen_dev(button1, "click", moveAllFreeLettersToRack, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*word_to_check*/ 4 && input.value !== /*word_to_check*/ ctx[2]) {
    				set_input_value(input, /*word_to_check*/ ctx[2]);
    			}

    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div0, null);
    				}
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block1) {
    				if_block1.p(ctx, dirty);
    			} else {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(div1, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if_block0.d();
    			if_block1.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $GameStateStore;
    	validate_store(GameStateStore, "GameStateStore");
    	component_subscribe($$self, GameStateStore, $$value => $$invalidate(5, $GameStateStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Buttons", slots, []);
    	let dictionnary_valid_word = null;
    	let word_submission_possible = false;
    	let word_to_check;

    	const checkWord = () => {
    		let w;

    		if (word_to_check.length > 1) {
    			// source: https://stackoverflow.com/a/37511463
    			w = word_to_check.normalize("NFD").replace(/\p{Diacritic}/gu, "").toUpperCase();

    			$$invalidate(0, dictionnary_valid_word = checkWordValidity(w));
    		} else {
    			$$invalidate(0, dictionnary_valid_word = null);
    		}
    	};

    	const play = () => {
    		askForWordSubmission($GameStateStore.id);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Buttons> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		word_to_check = this.value;
    		$$invalidate(2, word_to_check);
    	}

    	$$self.$capture_state = () => ({
    		GameStateStore,
    		checkWordValidity,
    		moveAllFreeLettersToRack,
    		askForWordSubmission,
    		askForNewGame,
    		dictionnary_valid_word,
    		word_submission_possible,
    		word_to_check,
    		checkWord,
    		play,
    		$GameStateStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("dictionnary_valid_word" in $$props) $$invalidate(0, dictionnary_valid_word = $$props.dictionnary_valid_word);
    		if ("word_submission_possible" in $$props) $$invalidate(1, word_submission_possible = $$props.word_submission_possible);
    		if ("word_to_check" in $$props) $$invalidate(2, word_to_check = $$props.word_to_check);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$GameStateStore*/ 32) {
    			{
    				if ($GameStateStore.evaluation && $GameStateStore.evaluation.is_position_valid && $GameStateStore.evaluation.is_word_valid) {
    					$$invalidate(1, word_submission_possible = true);
    				} else {
    					$$invalidate(1, word_submission_possible = false);
    				}
    			}
    		}
    	};

    	return [
    		dictionnary_valid_word,
    		word_submission_possible,
    		word_to_check,
    		checkWord,
    		play,
    		$GameStateStore,
    		input_input_handler
    	];
    }

    class Buttons extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Buttons",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src\game\Info.svelte generated by Svelte v3.38.2 */
    const file$2 = "src\\game\\Info.svelte";

    function create_fragment$2(ctx) {
    	let div4;
    	let div0;
    	let t0;
    	let span0;
    	let t1;
    	let t2;
    	let div1;
    	let t3;
    	let span1;
    	let t4;
    	let t5;
    	let div2;
    	let t6;
    	let span2;
    	let t7;
    	let t8;
    	let div3;
    	let t9;
    	let span3;
    	let t10;

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			t0 = text("Score: ");
    			span0 = element("span");
    			t1 = text(/*score*/ ctx[0]);
    			t2 = space();
    			div1 = element("div");
    			t3 = text("Score de maître MoLangeur: ");
    			span1 = element("span");
    			t4 = text(/*molangeur_score*/ ctx[1]);
    			t5 = space();
    			div2 = element("div");
    			t6 = text("Différence avec maître MoLangeur: ");
    			span2 = element("span");
    			t7 = text(/*difference*/ ctx[2]);
    			t8 = space();
    			div3 = element("div");
    			t9 = text("Meilleur score possible: ");
    			span3 = element("span");
    			t10 = text(/*molangeur_best*/ ctx[3]);
    			attr_dev(span0, "class", "value svelte-3utdym");
    			add_location(span0, file$2, 20, 11, 560);
    			add_location(div0, file$2, 19, 0, 542);
    			attr_dev(span1, "class", "value svelte-3utdym");
    			add_location(span1, file$2, 23, 31, 642);
    			add_location(div1, file$2, 22, 0, 604);
    			attr_dev(span2, "class", "value svelte-3utdym");
    			add_location(span2, file$2, 26, 38, 741);
    			add_location(div2, file$2, 25, 0, 696);
    			attr_dev(span3, "class", "value svelte-3utdym");
    			add_location(span3, file$2, 29, 29, 826);
    			add_location(div3, file$2, 28, 0, 790);
    			attr_dev(div4, "class", "score svelte-3utdym");
    			add_location(div4, file$2, 18, 0, 521);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div0, t0);
    			append_dev(div0, span0);
    			append_dev(span0, t1);
    			append_dev(div4, t2);
    			append_dev(div4, div1);
    			append_dev(div1, t3);
    			append_dev(div1, span1);
    			append_dev(span1, t4);
    			append_dev(div4, t5);
    			append_dev(div4, div2);
    			append_dev(div2, t6);
    			append_dev(div2, span2);
    			append_dev(span2, t7);
    			append_dev(div4, t8);
    			append_dev(div4, div3);
    			append_dev(div3, t9);
    			append_dev(div3, span3);
    			append_dev(span3, t10);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*score*/ 1) set_data_dev(t1, /*score*/ ctx[0]);
    			if (dirty & /*molangeur_score*/ 2) set_data_dev(t4, /*molangeur_score*/ ctx[1]);
    			if (dirty & /*difference*/ 4) set_data_dev(t7, /*difference*/ ctx[2]);
    			if (dirty & /*molangeur_best*/ 8) set_data_dev(t10, /*molangeur_best*/ ctx[3]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let score;
    	let molangeur_score;
    	let difference;
    	let molangeur_best;
    	let $GameStateStore;
    	validate_store(GameStateStore, "GameStateStore");
    	component_subscribe($$self, GameStateStore, $$value => $$invalidate(4, $GameStateStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Info", slots, []);
    	let id = $GameStateStore.id;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Info> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		GameStateStore,
    		id,
    		$GameStateStore,
    		score,
    		molangeur_score,
    		difference,
    		molangeur_best
    	});

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(5, id = $$props.id);
    		if ("score" in $$props) $$invalidate(0, score = $$props.score);
    		if ("molangeur_score" in $$props) $$invalidate(1, molangeur_score = $$props.molangeur_score);
    		if ("difference" in $$props) $$invalidate(2, difference = $$props.difference);
    		if ("molangeur_best" in $$props) $$invalidate(3, molangeur_best = $$props.molangeur_best);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$GameStateStore, molangeur_score, score*/ 19) {
    			{
    				let player = $GameStateStore.players.filter(e => e.id === id)[0];
    				let molangeur = $GameStateStore.molangeur;
    				$$invalidate(0, score = player ? player.score : 0);
    				$$invalidate(1, molangeur_score = molangeur.score);
    				$$invalidate(3, molangeur_best = molangeur.next_score);
    				$$invalidate(2, difference = molangeur_score - score);
    			}
    		}
    	};

    	$$invalidate(0, score = 0);
    	$$invalidate(1, molangeur_score = 0);
    	$$invalidate(2, difference = 0);
    	$$invalidate(3, molangeur_best = 0);
    	return [score, molangeur_score, difference, molangeur_best, $GameStateStore];
    }

    class Info extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Info",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src\game\GamePage.svelte generated by Svelte v3.38.2 */
    const file$1 = "src\\game\\GamePage.svelte";

    function create_fragment$1(ctx) {
    	let div4;
    	let div0;
    	let info;
    	let t0;
    	let div1;
    	let game;
    	let t1;
    	let div2;
    	let buttons;
    	let t2;
    	let div3;
    	let mastermolangeur;
    	let div4_style_value;
    	let current;
    	info = new Info({ $$inline: true });

    	game = new Game({
    			props: { width: /*width*/ ctx[0] },
    			$$inline: true
    		});

    	buttons = new Buttons({ $$inline: true });
    	mastermolangeur = new MasterMolangeur({ $$inline: true });

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			create_component(info.$$.fragment);
    			t0 = space();
    			div1 = element("div");
    			create_component(game.$$.fragment);
    			t1 = space();
    			div2 = element("div");
    			create_component(buttons.$$.fragment);
    			t2 = space();
    			div3 = element("div");
    			create_component(mastermolangeur.$$.fragment);
    			attr_dev(div0, "class", "info extra svelte-wpuk4j");
    			add_location(div0, file$1, 29, 8, 813);
    			attr_dev(div1, "class", "game svelte-wpuk4j");
    			add_location(div1, file$1, 30, 8, 862);
    			attr_dev(div2, "class", "extra btns svelte-wpuk4j");
    			add_location(div2, file$1, 31, 8, 939);
    			attr_dev(div3, "class", "mstm extra svelte-wpuk4j");
    			add_location(div3, file$1, 32, 8, 990);
    			attr_dev(div4, "class", "container svelte-wpuk4j");
    			attr_dev(div4, "style", div4_style_value = `--padd: ${/*padding*/ ctx[2]}px;`);
    			add_location(div4, file$1, 28, 0, 747);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			mount_component(info, div0, null);
    			append_dev(div4, t0);
    			append_dev(div4, div1);
    			mount_component(game, div1, null);
    			/*div1_binding*/ ctx[3](div1);
    			append_dev(div4, t1);
    			append_dev(div4, div2);
    			mount_component(buttons, div2, null);
    			append_dev(div4, t2);
    			append_dev(div4, div3);
    			mount_component(mastermolangeur, div3, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const game_changes = {};
    			if (dirty & /*width*/ 1) game_changes.width = /*width*/ ctx[0];
    			game.$set(game_changes);

    			if (!current || dirty & /*padding*/ 4 && div4_style_value !== (div4_style_value = `--padd: ${/*padding*/ ctx[2]}px;`)) {
    				attr_dev(div4, "style", div4_style_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.$$.fragment, local);
    			transition_in(game.$$.fragment, local);
    			transition_in(buttons.$$.fragment, local);
    			transition_in(mastermolangeur.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(info.$$.fragment, local);
    			transition_out(game.$$.fragment, local);
    			transition_out(buttons.$$.fragment, local);
    			transition_out(mastermolangeur.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(info);
    			destroy_component(game);
    			/*div1_binding*/ ctx[3](null);
    			destroy_component(buttons);
    			destroy_component(mastermolangeur);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let padding;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("GamePage", slots, []);
    	let container;
    	let width = 500;

    	const onResize = () => {
    		let box = container.getBoundingClientRect();

    		// console.log("box", box)
    		$$invalidate(0, width = box.width);
    	};

    	onMount(() => {
    		window.addEventListener("resize", onResize);
    		onResize();
    	});

    	onDestroy(() => {
    		window.removeEventListener("resize", onResize);
    	});

    	askForNewGame();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<GamePage> was created with unknown prop '${key}'`);
    	});

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			container = $$value;
    			$$invalidate(1, container);
    		});
    	}

    	$$self.$capture_state = () => ({
    		askForNewGame,
    		Game,
    		MasterMolangeur,
    		Buttons,
    		Info,
    		onMount,
    		onDestroy,
    		container,
    		width,
    		onResize,
    		padding
    	});

    	$$self.$inject_state = $$props => {
    		if ("container" in $$props) $$invalidate(1, container = $$props.container);
    		if ("width" in $$props) $$invalidate(0, width = $$props.width);
    		if ("padding" in $$props) $$invalidate(2, padding = $$props.padding);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*width*/ 1) {
    			$$invalidate(2, padding = width / 15 / 2);
    		}
    	};

    	return [width, container, padding, div1_binding];
    }

    class GamePage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GamePage",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src\App.svelte generated by Svelte v3.38.2 */
    const file = "src\\App.svelte";

    // (19:0) {:else}
    function create_else_block(ctx) {
    	let div3;
    	let div1;
    	let div0;
    	let t0;
    	let img;
    	let img_src_value;
    	let t1;
    	let div2;
    	let gamepage;
    	let current;
    	gamepage = new GamePage({ $$inline: true });

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			img = element("img");
    			t1 = space();
    			div2 = element("div");
    			create_component(gamepage.$$.fragment);
    			attr_dev(div0, "class", "navigation-toggle svelte-v3cdul");
    			add_location(div0, file, 21, 8, 464);
    			if (img.src !== (img_src_value = "../images/molangeur-h_2.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-v3cdul");
    			add_location(img, file, 24, 8, 535);
    			attr_dev(div1, "class", "header-navigation svelte-v3cdul");
    			add_location(div1, file, 20, 4, 423);
    			attr_dev(div2, "class", "content svelte-v3cdul");
    			add_location(div2, file, 26, 4, 599);
    			attr_dev(div3, "class", "container svelte-v3cdul");
    			add_location(div3, file, 19, 0, 394);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div1);
    			append_dev(div1, div0);
    			append_dev(div1, t0);
    			append_dev(div1, img);
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			mount_component(gamepage, div2, null);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(gamepage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(gamepage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			destroy_component(gamepage);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(19:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (12:0) {#if !app_ready}
    function create_if_block(ctx) {
    	let div1;
    	let div0;
    	let p0;
    	let t1;
    	let p1;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			p0 = element("p");
    			p0.textContent = "Molangeur se prépare.";
    			t1 = space();
    			p1 = element("p");
    			p1.textContent = "Veuillez patienter quelques instants...";
    			add_location(p0, file, 14, 12, 265);
    			add_location(p1, file, 15, 12, 308);
    			attr_dev(div0, "class", "svelte-v3cdul");
    			add_location(div0, file, 13, 8, 246);
    			attr_dev(div1, "class", "loading svelte-v3cdul");
    			add_location(div1, file, 12, 5, 215);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, p0);
    			append_dev(div0, t1);
    			append_dev(div0, p1);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(12:0) {#if !app_ready}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (!/*app_ready*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	let app_ready = false;

    	initDictionnary(() => {
    		$$invalidate(0, app_ready = true);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ GamePage, initDictionnary, app_ready });

    	$$self.$inject_state = $$props => {
    		if ("app_ready" in $$props) $$invalidate(0, app_ready = $$props.app_ready);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [app_ready];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    // import makeDictionnary from "./make_dictionnary"
    // makeDictionnary()

    const app = new App({
    	target: document.body,
    	props: {
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
