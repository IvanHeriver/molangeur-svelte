
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
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
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
    // export const LETTERS = {
    //     _: {pts: 0, n: 0, vowel: true, consonant: true},
    //     A: {pts: 1, n: 900, vowel: true, consonant: false},
    //     B: {pts: 3, n: 0, vowel: false, consonant: true},
    //     C: {pts: 3, n: 0, vowel: false, consonant: true},
    //     D: {pts: 2, n:0, vowel: false, consonant: true},
    //     E: {pts: 1, n: 0, vowel: true, consonant: false},
    //     F: {pts: 4, n: 0, vowel: false, consonant: true},
    //     G: {pts: 2, n: 0, vowel: false, consonant: true},
    //     H: {pts: 4, n: 0, vowel: false, consonant: true},
    //     I: {pts: 1, n: 0, vowel: true, consonant: false},
    //     J: {pts: 8, n: 0, vowel: false, consonant: true},
    //     K: {pts: 10, n: 0, vowel: false, consonant: true},
    //     L: {pts: 1, n: 0, vowel: false, consonant: true},
    //     M: {pts: 2, n: 0, vowel: false, consonant: true},
    //     N: {pts: 1, n: 0, vowel: false, consonant: true},
    //     O: {pts: 1, n: 0, vowel: true, consonant: false},
    //     P: {pts: 3, n: 0, vowel: false, consonant: true},
    //     Q: {pts: 8, n:0, vowel: false, consonant: true},
    //     R: {pts: 1, n: 0, vowel: false, consonant: true},
    //     S: {pts: 1, n: 0, vowel: false, consonant: true},
    //     T: {pts: 1, n: 0, vowel: false, consonant: true},
    //     U: {pts: 1, n: 0, vowel: true, consonant: false},
    //     V: {pts: 4, n: 0, vowel: false, consonant: true},
    //     W: {pts: 10, n: 0, vowel: false, consonant: true},
    //     X: {pts: 10, n:0, vowel: false, consonant: true},
    //     Y: {pts: 10, n: 1000, vowel: true, consonant: false},
    //     Z: {pts: 10, n: 0, vowel: false, consonant: true},
    // }
    let ltrs = Object.keys(LETTERS).filter(e=>e!=="_");
    const LTRS = ltrs;

    const CELLS = {
        letter_double: [3, 11, 36, 38, 45, 52, 59, 92, 96, 98, 102, 108,
             116, 122, 126, 128, 132, 165, 172, 179, 186, 188, 213, 221],
        letter_triple: [20, 24, 76, 80, 84, 88, 136, 140, 144, 148, 200, 204],
        word_double: [16, 28, 32, 42, 48, 56, 64, 70, 112, 154, 160, 168, 176, 182, 192, 196, 208],
        word_triple: [0, 7, 14, 105, 119, 210, 217, 224]
    };
    // export const CELLS = {
    //     letter_double: [3, 11, 36, 38, 45, 52, 59, 92, 96, 98, 102, 108,
    //          116, 122,  128, 132, 165, 172, 179, 186, 188, 213, 221],
    //     letter_triple: [20, 24, 76, 80, 84, 88, 136, 140, 144, 148, 200, 204],
    //     word_double: [16, 28, 32, 42, 48, 56, 64, 70, 112, 154, 160, 168, 176, 182, 192, 196, 208, 126],
    //     word_triple: [0, 7, 14, 105, 119, 210, 217, 224]
    // }

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
            let words = results.flat().sort((a, b) => {
                if (a.dir === "V" && b.dir === "H") return 1
                if (a.dir === "V" && b.dir === "V") return 0
                if (a.dir === "H" && b.dir === "V") return -1
                return 0
            }).sort((a, b) => b.pts - a.pts);
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

        let pos_multiplier = position_group.indices.map(e=>POINTS[e]);
        // console.log("-----------------")
        // console.log("k=", position_group.indices[0])
        // console.log(position_group)
        // console.log(raw_found_words)
        // console.log(pos_multiplier)
        // console.log(vertical)
        // console.log(arr_free_constraints)
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

    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function createCommonjsModule(fn) {
      var module = { exports: {} };
    	return fn(module, module.exports), module.exports;
    }

    /*!
     * html2canvas 1.0.0-rc.7 <https://html2canvas.hertzen.com>
     * Copyright (c) 2020 Niklas von Hertzen <https://hertzen.com>
     * Released under MIT License
     */

    var html2canvas = createCommonjsModule(function (module, exports) {
    (function (global, factory) {
        module.exports = factory() ;
    }(commonjsGlobal, function () {
        /*! *****************************************************************************
        Copyright (c) Microsoft Corporation. All rights reserved.
        Licensed under the Apache License, Version 2.0 (the "License"); you may not use
        this file except in compliance with the License. You may obtain a copy of the
        License at http://www.apache.org/licenses/LICENSE-2.0

        THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
        KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
        WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
        MERCHANTABLITY OR NON-INFRINGEMENT.

        See the Apache Version 2.0 License for specific language governing permissions
        and limitations under the License.
        ***************************************************************************** */
        /* global Reflect, Promise */

        var extendStatics = function(d, b) {
            extendStatics = Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
                function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
            return extendStatics(d, b);
        };

        function __extends(d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        }

        var __assign = function() {
            __assign = Object.assign || function __assign(t) {
                for (var s, i = 1, n = arguments.length; i < n; i++) {
                    s = arguments[i];
                    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
                }
                return t;
            };
            return __assign.apply(this, arguments);
        };

        function __awaiter(thisArg, _arguments, P, generator) {
            return new (P || (P = Promise))(function (resolve, reject) {
                function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
                function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
                function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
                step((generator = generator.apply(thisArg, _arguments || [])).next());
            });
        }

        function __generator(thisArg, body) {
            var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
            return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
            function verb(n) { return function (v) { return step([n, v]); }; }
            function step(op) {
                if (f) throw new TypeError("Generator is already executing.");
                while (_) try {
                    if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                    if (y = 0, t) op = [op[0] & 2, t.value];
                    switch (op[0]) {
                        case 0: case 1: t = op; break;
                        case 4: _.label++; return { value: op[1], done: false };
                        case 5: _.label++; y = op[1]; op = [0]; continue;
                        case 7: op = _.ops.pop(); _.trys.pop(); continue;
                        default:
                            if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                            if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                            if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                            if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                            if (t[2]) _.ops.pop();
                            _.trys.pop(); continue;
                    }
                    op = body.call(thisArg, _);
                } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
                if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
            }
        }

        var Bounds = /** @class */ (function () {
            function Bounds(x, y, w, h) {
                this.left = x;
                this.top = y;
                this.width = w;
                this.height = h;
            }
            Bounds.prototype.add = function (x, y, w, h) {
                return new Bounds(this.left + x, this.top + y, this.width + w, this.height + h);
            };
            Bounds.fromClientRect = function (clientRect) {
                return new Bounds(clientRect.left, clientRect.top, clientRect.width, clientRect.height);
            };
            return Bounds;
        }());
        var parseBounds = function (node) {
            return Bounds.fromClientRect(node.getBoundingClientRect());
        };
        var parseDocumentSize = function (document) {
            var body = document.body;
            var documentElement = document.documentElement;
            if (!body || !documentElement) {
                throw new Error("Unable to get document size");
            }
            var width = Math.max(Math.max(body.scrollWidth, documentElement.scrollWidth), Math.max(body.offsetWidth, documentElement.offsetWidth), Math.max(body.clientWidth, documentElement.clientWidth));
            var height = Math.max(Math.max(body.scrollHeight, documentElement.scrollHeight), Math.max(body.offsetHeight, documentElement.offsetHeight), Math.max(body.clientHeight, documentElement.clientHeight));
            return new Bounds(0, 0, width, height);
        };

        /*
         * css-line-break 1.1.1 <https://github.com/niklasvh/css-line-break#readme>
         * Copyright (c) 2019 Niklas von Hertzen <https://hertzen.com>
         * Released under MIT License
         */
        var toCodePoints = function (str) {
            var codePoints = [];
            var i = 0;
            var length = str.length;
            while (i < length) {
                var value = str.charCodeAt(i++);
                if (value >= 0xd800 && value <= 0xdbff && i < length) {
                    var extra = str.charCodeAt(i++);
                    if ((extra & 0xfc00) === 0xdc00) {
                        codePoints.push(((value & 0x3ff) << 10) + (extra & 0x3ff) + 0x10000);
                    }
                    else {
                        codePoints.push(value);
                        i--;
                    }
                }
                else {
                    codePoints.push(value);
                }
            }
            return codePoints;
        };
        var fromCodePoint = function () {
            var codePoints = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                codePoints[_i] = arguments[_i];
            }
            if (String.fromCodePoint) {
                return String.fromCodePoint.apply(String, codePoints);
            }
            var length = codePoints.length;
            if (!length) {
                return '';
            }
            var codeUnits = [];
            var index = -1;
            var result = '';
            while (++index < length) {
                var codePoint = codePoints[index];
                if (codePoint <= 0xffff) {
                    codeUnits.push(codePoint);
                }
                else {
                    codePoint -= 0x10000;
                    codeUnits.push((codePoint >> 10) + 0xd800, codePoint % 0x400 + 0xdc00);
                }
                if (index + 1 === length || codeUnits.length > 0x4000) {
                    result += String.fromCharCode.apply(String, codeUnits);
                    codeUnits.length = 0;
                }
            }
            return result;
        };
        var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        // Use a lookup table to find the index.
        var lookup = typeof Uint8Array === 'undefined' ? [] : new Uint8Array(256);
        for (var i = 0; i < chars.length; i++) {
            lookup[chars.charCodeAt(i)] = i;
        }
        var decode = function (base64) {
            var bufferLength = base64.length * 0.75, len = base64.length, i, p = 0, encoded1, encoded2, encoded3, encoded4;
            if (base64[base64.length - 1] === '=') {
                bufferLength--;
                if (base64[base64.length - 2] === '=') {
                    bufferLength--;
                }
            }
            var buffer = typeof ArrayBuffer !== 'undefined' &&
                typeof Uint8Array !== 'undefined' &&
                typeof Uint8Array.prototype.slice !== 'undefined'
                ? new ArrayBuffer(bufferLength)
                : new Array(bufferLength);
            var bytes = Array.isArray(buffer) ? buffer : new Uint8Array(buffer);
            for (i = 0; i < len; i += 4) {
                encoded1 = lookup[base64.charCodeAt(i)];
                encoded2 = lookup[base64.charCodeAt(i + 1)];
                encoded3 = lookup[base64.charCodeAt(i + 2)];
                encoded4 = lookup[base64.charCodeAt(i + 3)];
                bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
                bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
                bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
            }
            return buffer;
        };
        var polyUint16Array = function (buffer) {
            var length = buffer.length;
            var bytes = [];
            for (var i = 0; i < length; i += 2) {
                bytes.push((buffer[i + 1] << 8) | buffer[i]);
            }
            return bytes;
        };
        var polyUint32Array = function (buffer) {
            var length = buffer.length;
            var bytes = [];
            for (var i = 0; i < length; i += 4) {
                bytes.push((buffer[i + 3] << 24) | (buffer[i + 2] << 16) | (buffer[i + 1] << 8) | buffer[i]);
            }
            return bytes;
        };

        /** Shift size for getting the index-2 table offset. */
        var UTRIE2_SHIFT_2 = 5;
        /** Shift size for getting the index-1 table offset. */
        var UTRIE2_SHIFT_1 = 6 + 5;
        /**
         * Shift size for shifting left the index array values.
         * Increases possible data size with 16-bit index values at the cost
         * of compactability.
         * This requires data blocks to be aligned by UTRIE2_DATA_GRANULARITY.
         */
        var UTRIE2_INDEX_SHIFT = 2;
        /**
         * Difference between the two shift sizes,
         * for getting an index-1 offset from an index-2 offset. 6=11-5
         */
        var UTRIE2_SHIFT_1_2 = UTRIE2_SHIFT_1 - UTRIE2_SHIFT_2;
        /**
         * The part of the index-2 table for U+D800..U+DBFF stores values for
         * lead surrogate code _units_ not code _points_.
         * Values for lead surrogate code _points_ are indexed with this portion of the table.
         * Length=32=0x20=0x400>>UTRIE2_SHIFT_2. (There are 1024=0x400 lead surrogates.)
         */
        var UTRIE2_LSCP_INDEX_2_OFFSET = 0x10000 >> UTRIE2_SHIFT_2;
        /** Number of entries in a data block. 32=0x20 */
        var UTRIE2_DATA_BLOCK_LENGTH = 1 << UTRIE2_SHIFT_2;
        /** Mask for getting the lower bits for the in-data-block offset. */
        var UTRIE2_DATA_MASK = UTRIE2_DATA_BLOCK_LENGTH - 1;
        var UTRIE2_LSCP_INDEX_2_LENGTH = 0x400 >> UTRIE2_SHIFT_2;
        /** Count the lengths of both BMP pieces. 2080=0x820 */
        var UTRIE2_INDEX_2_BMP_LENGTH = UTRIE2_LSCP_INDEX_2_OFFSET + UTRIE2_LSCP_INDEX_2_LENGTH;
        /**
         * The 2-byte UTF-8 version of the index-2 table follows at offset 2080=0x820.
         * Length 32=0x20 for lead bytes C0..DF, regardless of UTRIE2_SHIFT_2.
         */
        var UTRIE2_UTF8_2B_INDEX_2_OFFSET = UTRIE2_INDEX_2_BMP_LENGTH;
        var UTRIE2_UTF8_2B_INDEX_2_LENGTH = 0x800 >> 6; /* U+0800 is the first code point after 2-byte UTF-8 */
        /**
         * The index-1 table, only used for supplementary code points, at offset 2112=0x840.
         * Variable length, for code points up to highStart, where the last single-value range starts.
         * Maximum length 512=0x200=0x100000>>UTRIE2_SHIFT_1.
         * (For 0x100000 supplementary code points U+10000..U+10ffff.)
         *
         * The part of the index-2 table for supplementary code points starts
         * after this index-1 table.
         *
         * Both the index-1 table and the following part of the index-2 table
         * are omitted completely if there is only BMP data.
         */
        var UTRIE2_INDEX_1_OFFSET = UTRIE2_UTF8_2B_INDEX_2_OFFSET + UTRIE2_UTF8_2B_INDEX_2_LENGTH;
        /**
         * Number of index-1 entries for the BMP. 32=0x20
         * This part of the index-1 table is omitted from the serialized form.
         */
        var UTRIE2_OMITTED_BMP_INDEX_1_LENGTH = 0x10000 >> UTRIE2_SHIFT_1;
        /** Number of entries in an index-2 block. 64=0x40 */
        var UTRIE2_INDEX_2_BLOCK_LENGTH = 1 << UTRIE2_SHIFT_1_2;
        /** Mask for getting the lower bits for the in-index-2-block offset. */
        var UTRIE2_INDEX_2_MASK = UTRIE2_INDEX_2_BLOCK_LENGTH - 1;
        var slice16 = function (view, start, end) {
            if (view.slice) {
                return view.slice(start, end);
            }
            return new Uint16Array(Array.prototype.slice.call(view, start, end));
        };
        var slice32 = function (view, start, end) {
            if (view.slice) {
                return view.slice(start, end);
            }
            return new Uint32Array(Array.prototype.slice.call(view, start, end));
        };
        var createTrieFromBase64 = function (base64) {
            var buffer = decode(base64);
            var view32 = Array.isArray(buffer) ? polyUint32Array(buffer) : new Uint32Array(buffer);
            var view16 = Array.isArray(buffer) ? polyUint16Array(buffer) : new Uint16Array(buffer);
            var headerLength = 24;
            var index = slice16(view16, headerLength / 2, view32[4] / 2);
            var data = view32[5] === 2
                ? slice16(view16, (headerLength + view32[4]) / 2)
                : slice32(view32, Math.ceil((headerLength + view32[4]) / 4));
            return new Trie(view32[0], view32[1], view32[2], view32[3], index, data);
        };
        var Trie = /** @class */ (function () {
            function Trie(initialValue, errorValue, highStart, highValueIndex, index, data) {
                this.initialValue = initialValue;
                this.errorValue = errorValue;
                this.highStart = highStart;
                this.highValueIndex = highValueIndex;
                this.index = index;
                this.data = data;
            }
            /**
             * Get the value for a code point as stored in the Trie.
             *
             * @param codePoint the code point
             * @return the value
             */
            Trie.prototype.get = function (codePoint) {
                var ix;
                if (codePoint >= 0) {
                    if (codePoint < 0x0d800 || (codePoint > 0x0dbff && codePoint <= 0x0ffff)) {
                        // Ordinary BMP code point, excluding leading surrogates.
                        // BMP uses a single level lookup.  BMP index starts at offset 0 in the Trie2 index.
                        // 16 bit data is stored in the index array itself.
                        ix = this.index[codePoint >> UTRIE2_SHIFT_2];
                        ix = (ix << UTRIE2_INDEX_SHIFT) + (codePoint & UTRIE2_DATA_MASK);
                        return this.data[ix];
                    }
                    if (codePoint <= 0xffff) {
                        // Lead Surrogate Code Point.  A Separate index section is stored for
                        // lead surrogate code units and code points.
                        //   The main index has the code unit data.
                        //   For this function, we need the code point data.
                        // Note: this expression could be refactored for slightly improved efficiency, but
                        //       surrogate code points will be so rare in practice that it's not worth it.
                        ix = this.index[UTRIE2_LSCP_INDEX_2_OFFSET + ((codePoint - 0xd800) >> UTRIE2_SHIFT_2)];
                        ix = (ix << UTRIE2_INDEX_SHIFT) + (codePoint & UTRIE2_DATA_MASK);
                        return this.data[ix];
                    }
                    if (codePoint < this.highStart) {
                        // Supplemental code point, use two-level lookup.
                        ix = UTRIE2_INDEX_1_OFFSET - UTRIE2_OMITTED_BMP_INDEX_1_LENGTH + (codePoint >> UTRIE2_SHIFT_1);
                        ix = this.index[ix];
                        ix += (codePoint >> UTRIE2_SHIFT_2) & UTRIE2_INDEX_2_MASK;
                        ix = this.index[ix];
                        ix = (ix << UTRIE2_INDEX_SHIFT) + (codePoint & UTRIE2_DATA_MASK);
                        return this.data[ix];
                    }
                    if (codePoint <= 0x10ffff) {
                        return this.data[this.highValueIndex];
                    }
                }
                // Fall through.  The code point is outside of the legal range of 0..0x10ffff.
                return this.errorValue;
            };
            return Trie;
        }());

        var base64 = 'KwAAAAAAAAAACA4AIDoAAPAfAAACAAAAAAAIABAAGABAAEgAUABYAF4AZgBeAGYAYABoAHAAeABeAGYAfACEAIAAiACQAJgAoACoAK0AtQC9AMUAXgBmAF4AZgBeAGYAzQDVAF4AZgDRANkA3gDmAOwA9AD8AAQBDAEUARoBIgGAAIgAJwEvATcBPwFFAU0BTAFUAVwBZAFsAXMBewGDATAAiwGTAZsBogGkAawBtAG8AcIBygHSAdoB4AHoAfAB+AH+AQYCDgIWAv4BHgImAi4CNgI+AkUCTQJTAlsCYwJrAnECeQKBAk0CiQKRApkCoQKoArACuALAAsQCzAIwANQC3ALkAjAA7AL0AvwCAQMJAxADGAMwACADJgMuAzYDPgOAAEYDSgNSA1IDUgNaA1oDYANiA2IDgACAAGoDgAByA3YDfgOAAIQDgACKA5IDmgOAAIAAogOqA4AAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAK8DtwOAAIAAvwPHA88D1wPfAyAD5wPsA/QD/AOAAIAABAQMBBIEgAAWBB4EJgQuBDMEIAM7BEEEXgBJBCADUQRZBGEEaQQwADAAcQQ+AXkEgQSJBJEEgACYBIAAoASoBK8EtwQwAL8ExQSAAIAAgACAAIAAgACgAM0EXgBeAF4AXgBeAF4AXgBeANUEXgDZBOEEXgDpBPEE+QQBBQkFEQUZBSEFKQUxBTUFPQVFBUwFVAVcBV4AYwVeAGsFcwV7BYMFiwWSBV4AmgWgBacFXgBeAF4AXgBeAKsFXgCyBbEFugW7BcIFwgXIBcIFwgXQBdQF3AXkBesF8wX7BQMGCwYTBhsGIwYrBjMGOwZeAD8GRwZNBl4AVAZbBl4AXgBeAF4AXgBeAF4AXgBeAF4AXgBeAGMGXgBqBnEGXgBeAF4AXgBeAF4AXgBeAF4AXgB5BoAG4wSGBo4GkwaAAIADHgR5AF4AXgBeAJsGgABGA4AAowarBrMGswagALsGwwbLBjAA0wbaBtoG3QbaBtoG2gbaBtoG2gblBusG8wb7BgMHCwcTBxsHCwcjBysHMAc1BzUHOgdCB9oGSgdSB1oHYAfaBloHaAfaBlIH2gbaBtoG2gbaBtoG2gbaBjUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHbQdeAF4ANQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQd1B30HNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1B4MH2gaKB68EgACAAIAAgACAAIAAgACAAI8HlwdeAJ8HpweAAIAArwe3B14AXgC/B8UHygcwANAH2AfgB4AA6AfwBz4B+AcACFwBCAgPCBcIogEYAR8IJwiAAC8INwg/CCADRwhPCFcIXwhnCEoDGgSAAIAAgABvCHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIfQh3CHgIeQh6CHsIfAh9CHcIeAh5CHoIewh8CH0Idwh4CHkIegh7CHwIhAiLCI4IMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwAJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlggwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAANQc1BzUHNQc1BzUHNQc1BzUHNQc1B54INQc1B6II2gaqCLIIugiAAIAAvgjGCIAAgACAAIAAgACAAIAAgACAAIAAywiHAYAA0wiAANkI3QjlCO0I9Aj8CIAAgACAAAIJCgkSCRoJIgknCTYHLwk3CZYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiWCJYIlgiAAIAAAAFAAXgBeAGAAcABeAHwAQACQAKAArQC9AJ4AXgBeAE0A3gBRAN4A7AD8AMwBGgEAAKcBNwEFAUwBXAF4QkhCmEKnArcCgAHHAsABz4LAAcABwAHAAd+C6ABoAG+C/4LAAcABwAHAAc+DF4MAAcAB54M3gweDV4Nng3eDaABoAGgAaABoAGgAaABoAGgAaABoAGgAaABoAGgAaABoAGgAaABoAEeDqABVg6WDqABoQ6gAaABoAHXDvcONw/3DvcO9w73DvcO9w73DvcO9w73DvcO9w73DvcO9w73DvcO9w73DvcO9w73DvcO9w73DvcO9w73DvcO9w73DncPAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcABwAHAAcAB7cPPwlGCU4JMACAAIAAgABWCV4JYQmAAGkJcAl4CXwJgAkwADAAMAAwAIgJgACLCZMJgACZCZ8JowmrCYAAswkwAF4AXgB8AIAAuwkABMMJyQmAAM4JgADVCTAAMAAwADAAgACAAIAAgACAAIAAgACAAIAAqwYWBNkIMAAwADAAMADdCeAJ6AnuCR4E9gkwAP4JBQoNCjAAMACAABUK0wiAAB0KJAosCjQKgAAwADwKQwqAAEsKvQmdCVMKWwowADAAgACAALcEMACAAGMKgABrCjAAMAAwADAAMAAwADAAMAAwADAAMAAeBDAAMAAwADAAMAAwADAAMAAwADAAMAAwAIkEPQFzCnoKiQSCCooKkAqJBJgKoAqkCokEGAGsCrQKvArBCjAAMADJCtEKFQHZCuEK/gHpCvEKMAAwADAAMACAAIwE+QowAIAAPwEBCzAAMAAwADAAMACAAAkLEQswAIAAPwEZCyELgAAOCCkLMAAxCzkLMAAwADAAMAAwADAAXgBeAEELMAAwADAAMAAwADAAMAAwAEkLTQtVC4AAXAtkC4AAiQkwADAAMAAwADAAMAAwADAAbAtxC3kLgAuFC4sLMAAwAJMLlwufCzAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAApwswADAAMACAAIAAgACvC4AAgACAAIAAgACAALcLMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAvwuAAMcLgACAAIAAgACAAIAAyguAAIAAgACAAIAA0QswADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAANkLgACAAIAA4AswADAAMAAwADAAMAAwADAAMAAwADAAMAAwAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAIAAgACJCR4E6AswADAAhwHwC4AA+AsADAgMEAwwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMACAAIAAGAwdDCUMMAAwAC0MNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQw1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHPQwwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADUHNQc1BzUHNQc1BzUHNQc2BzAAMAA5DDUHNQc1BzUHNQc1BzUHNQc1BzUHNQdFDDAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAgACAAIAATQxSDFoMMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwAF4AXgBeAF4AXgBeAF4AYgxeAGoMXgBxDHkMfwxeAIUMXgBeAI0MMAAwADAAMAAwAF4AXgCVDJ0MMAAwADAAMABeAF4ApQxeAKsMswy7DF4Awgy9DMoMXgBeAF4AXgBeAF4AXgBeAF4AXgDRDNkMeQBqCeAM3Ax8AOYM7Az0DPgMXgBeAF4AXgBeAF4AXgBeAF4AXgBeAF4AXgBeAF4AXgCgAAANoAAHDQ4NFg0wADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAeDSYNMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwAIAAgACAAIAAgACAAC4NMABeAF4ANg0wADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwAD4NRg1ODVYNXg1mDTAAbQ0wADAAMAAwADAAMAAwADAA2gbaBtoG2gbaBtoG2gbaBnUNeg3CBYANwgWFDdoGjA3aBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gaUDZwNpA2oDdoG2gawDbcNvw3HDdoG2gbPDdYN3A3fDeYN2gbsDfMN2gbaBvoN/g3aBgYODg7aBl4AXgBeABYOXgBeACUG2gYeDl4AJA5eACwO2w3aBtoGMQ45DtoG2gbaBtoGQQ7aBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gZJDjUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1B1EO2gY1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQdZDjUHNQc1BzUHNQc1B2EONQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHaA41BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1B3AO2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gY1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1BzUHNQc1B2EO2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gZJDtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBtoG2gbaBkkOeA6gAKAAoAAwADAAMAAwAKAAoACgAKAAoACgAKAAgA4wADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAAwADAAMAD//wQABAAEAAQABAAEAAQABAAEAA0AAwABAAEAAgAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAKABMAFwAeABsAGgAeABcAFgASAB4AGwAYAA8AGAAcAEsASwBLAEsASwBLAEsASwBLAEsAGAAYAB4AHgAeABMAHgBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAFgAbABIAHgAeAB4AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQABYADQARAB4ABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsABAAEAAQABAAEAAUABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAkAFgAaABsAGwAbAB4AHQAdAB4ATwAXAB4ADQAeAB4AGgAbAE8ATwAOAFAAHQAdAB0ATwBPABcATwBPAE8AFgBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAB4AHgAeAB4AUABQAFAAUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAB4AHgAeAFAATwBAAE8ATwBPAEAATwBQAFAATwBQAB4AHgAeAB4AHgAeAB0AHQAdAB0AHgAdAB4ADgBQAFAAUABQAFAAHgAeAB4AHgAeAB4AHgBQAB4AUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAJAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAkACQAJAAkACQAJAAkABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAeAB4AHgAeAFAAHgAeAB4AKwArAFAAUABQAFAAGABQACsAKwArACsAHgAeAFAAHgBQAFAAUAArAFAAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAAEAAQABAAEAAQABAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAUAAeAB4AHgAeAB4AHgArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwAYAA0AKwArAB4AHgAbACsABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQADQAEAB4ABAAEAB4ABAAEABMABAArACsAKwArACsAKwArACsAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAKwArACsAKwArAFYAVgBWAB4AHgArACsAKwArACsAKwArACsAKwArACsAHgAeAB4AHgAeAB4AHgAeAB4AGgAaABoAGAAYAB4AHgAEAAQABAAEAAQABAAEAAQABAAEAAQAEwAEACsAEwATAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABABLAEsASwBLAEsASwBLAEsASwBLABoAGQAZAB4AUABQAAQAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQABMAUAAEAAQABAAEAAQABAAEAB4AHgAEAAQABAAEAAQABABQAFAABAAEAB4ABAAEAAQABABQAFAASwBLAEsASwBLAEsASwBLAEsASwBQAFAAUAAeAB4AUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwAeAFAABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQAUABQAB4AHgAYABMAUAArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAFAABAAEAAQABAAEAFAABAAEAAQAUAAEAAQABAAEAAQAKwArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAArACsAHgArAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAeAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABABQAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAFAABAAEAAQABAAEAAQABABQAFAAUABQAFAAUABQAFAAUABQAAQABAANAA0ASwBLAEsASwBLAEsASwBLAEsASwAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQAKwBQAFAAUABQAFAAUABQAFAAKwArAFAAUAArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUAArAFAAKwArACsAUABQAFAAUAArACsABABQAAQABAAEAAQABAAEAAQAKwArAAQABAArACsABAAEAAQAUAArACsAKwArACsAKwArACsABAArACsAKwArAFAAUAArAFAAUABQAAQABAArACsASwBLAEsASwBLAEsASwBLAEsASwBQAFAAGgAaAFAAUABQAFAAUABMAB4AGwBQAB4AKwArACsABAAEAAQAKwBQAFAAUABQAFAAUAArACsAKwArAFAAUAArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUAArAFAAUAArAFAAUAArAFAAUAArACsABAArAAQABAAEAAQABAArACsAKwArAAQABAArACsABAAEAAQAKwArACsABAArACsAKwArACsAKwArAFAAUABQAFAAKwBQACsAKwArACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwAEAAQAUABQAFAABAArACsAKwArACsAKwArACsAKwArACsABAAEAAQAKwBQAFAAUABQAFAAUABQAFAAUAArAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUAArAFAAUAArAFAAUABQAFAAUAArACsABABQAAQABAAEAAQABAAEAAQABAArAAQABAAEACsABAAEAAQAKwArAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAAQABAArACsASwBLAEsASwBLAEsASwBLAEsASwAeABsAKwArACsAKwArACsAKwBQAAQABAAEAAQABAAEACsABAAEAAQAKwBQAFAAUABQAFAAUABQAFAAKwArAFAAUAArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQAKwArAAQABAArACsABAAEAAQAKwArACsAKwArACsAKwArAAQABAArACsAKwArAFAAUAArAFAAUABQAAQABAArACsASwBLAEsASwBLAEsASwBLAEsASwAeAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwAEAFAAKwBQAFAAUABQAFAAUAArACsAKwBQAFAAUAArAFAAUABQAFAAKwArACsAUABQACsAUAArAFAAUAArACsAKwBQAFAAKwArACsAUABQAFAAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwAEAAQABAAEAAQAKwArACsABAAEAAQAKwAEAAQABAAEACsAKwBQACsAKwArACsAKwArAAQAKwArACsAKwArACsAKwArACsAKwBLAEsASwBLAEsASwBLAEsASwBLAFAAUABQAB4AHgAeAB4AHgAeABsAHgArACsAKwArACsABAAEAAQABAArAFAAUABQAFAAUABQAFAAUAArAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArAFAABAAEAAQABAAEAAQABAArAAQABAAEACsABAAEAAQABAArACsAKwArACsAKwArAAQABAArAFAAUABQACsAKwArACsAKwBQAFAABAAEACsAKwBLAEsASwBLAEsASwBLAEsASwBLACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAB4AUAAEAAQABAArAFAAUABQAFAAUABQAFAAUAArAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQACsAKwAEAFAABAAEAAQABAAEAAQABAArAAQABAAEACsABAAEAAQABAArACsAKwArACsAKwArAAQABAArACsAKwArACsAKwArAFAAKwBQAFAABAAEACsAKwBLAEsASwBLAEsASwBLAEsASwBLACsAUABQACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAFAABAAEAAQABAAEAAQABAArAAQABAAEACsABAAEAAQABABQAB4AKwArACsAKwBQAFAAUAAEAFAAUABQAFAAUABQAFAAUABQAFAABAAEACsAKwBLAEsASwBLAEsASwBLAEsASwBLAFAAUABQAFAAUABQAFAAUABQABoAUABQAFAAUABQAFAAKwArAAQABAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQACsAUAArACsAUABQAFAAUABQAFAAUAArACsAKwAEACsAKwArACsABAAEAAQABAAEAAQAKwAEACsABAAEAAQABAAEAAQABAAEACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArAAQABAAeACsAKwArACsAKwArACsAKwArACsAKwArAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXAAqAFwAXAAqACoAKgAqACoAKgAqACsAKwArACsAGwBcAFwAXABcAFwAXABcACoAKgAqACoAKgAqACoAKgAeAEsASwBLAEsASwBLAEsASwBLAEsADQANACsAKwArACsAKwBcAFwAKwBcACsAKwBcAFwAKwBcACsAKwBcACsAKwArACsAKwArAFwAXABcAFwAKwBcAFwAXABcAFwAXABcACsAXABcAFwAKwBcACsAXAArACsAXABcACsAXABcAFwAXAAqAFwAXAAqACoAKgAqACoAKgArACoAKgBcACsAKwBcAFwAXABcAFwAKwBcACsAKgAqACoAKgAqACoAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArAFwAXABcAFwAUAAOAA4ADgAOAB4ADgAOAAkADgAOAA0ACQATABMAEwATABMACQAeABMAHgAeAB4ABAAEAB4AHgAeAB4AHgAeAEsASwBLAEsASwBLAEsASwBLAEsAUABQAFAAUABQAFAAUABQAFAAUAANAAQAHgAEAB4ABAAWABEAFgARAAQABABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAANAAQABAAEAAQABAANAAQABABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEACsABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsADQANAB4AHgAeAB4AHgAeAAQAHgAeAB4AHgAeAB4AKwAeAB4ADgAOAA0ADgAeAB4AHgAeAB4ACQAJACsAKwArACsAKwBcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqAFwASwBLAEsASwBLAEsASwBLAEsASwANAA0AHgAeAB4AHgBcAFwAXABcAFwAXAAqACoAKgAqAFwAXABcAFwAKgAqACoAXAAqACoAKgBcAFwAKgAqACoAKgAqACoAKgBcAFwAXAAqACoAKgAqAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAKgAqACoAKgAqACoAKgAqACoAKgAqACoAXAAqAEsASwBLAEsASwBLAEsASwBLAEsAKgAqACoAKgAqACoAUABQAFAAUABQAFAAKwBQACsAKwArACsAKwBQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAFAAUABQAFAAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQACsAKwBQAFAAUABQAFAAUABQACsAUAArAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUAArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUAArACsAUABQAFAAUABQAFAAUAArAFAAKwBQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwAEAAQABAAeAA0AHgAeAB4AHgAeAB4AHgBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAB4AHgAeAB4AHgAeAB4AHgAeACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAFAAUABQAFAAUABQACsAKwANAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAB4AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAA0AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQABYAEQArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAADQANAA0AUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAABAAEAAQAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAA0ADQArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQACsABAAEACsAKwArACsAKwArACsAKwArACsAKwArAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXAAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoADQANABUAXAANAB4ADQAbAFwAKgArACsASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArAB4AHgATABMADQANAA4AHgATABMAHgAEAAQABAAJACsASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAUABQAFAAUABQAAQABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABABQACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArACsABAAEAAQABAAEAAQABAAEAAQABAAEAAQAKwArACsAKwAeACsAKwArABMAEwBLAEsASwBLAEsASwBLAEsASwBLAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcACsAKwBcAFwAXABcAFwAKwArACsAKwArACsAKwArACsAKwArAFwAXABcAFwAXABcAFwAXABcAFwAXABcACsAKwArACsAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAKwArACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwBcACsAKwArACoAKgBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEACsAKwAeAB4AXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAKgAqACoAKgAqACoAKgAqACoAKgArACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgArACsABABLAEsASwBLAEsASwBLAEsASwBLACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAKgAqACoAKgAqACoAKgBcACoAKgAqACoAKgAqACsAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArAAQABAAEAAQABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQAUABQAFAAUABQAFAAUAArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsADQANAB4ADQANAA0ADQAeAB4AHgAeAB4AHgAeAB4AHgAeAAQABAAEAAQABAAEAAQABAAEAB4AHgAeAB4AHgAeAB4AHgAeACsAKwArAAQABAAEAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAUABQAEsASwBLAEsASwBLAEsASwBLAEsAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArACsAKwArACsAKwArACsAHgAeAB4AHgBQAFAAUABQAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArACsAKwANAA0ADQANAA0ASwBLAEsASwBLAEsASwBLAEsASwArACsAKwBQAFAAUABLAEsASwBLAEsASwBLAEsASwBLAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAANAA0AUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAB4AHgAeAB4AHgAeAB4AHgArACsAKwArACsAKwArACsABAAEAAQAHgAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAFAAUABQAFAABABQAFAAUABQAAQABAAEAFAAUAAEAAQABAArACsAKwArACsAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAKwAEAAQABAAEAAQAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAUABQAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAUAArAFAAKwBQACsAUAArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACsAHgAeAB4AHgAeAB4AHgAeAFAAHgAeAB4AUABQAFAAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAFAAUABQAFAAKwArAB4AHgAeAB4AHgAeACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAUABQAFAAKwAeAB4AHgAeAB4AHgAeAA4AHgArAA0ADQANAA0ADQANAA0ACQANAA0ADQAIAAQACwAEAAQADQAJAA0ADQAMAB0AHQAeABcAFwAWABcAFwAXABYAFwAdAB0AHgAeABQAFAAUAA0AAQABAAQABAAEAAQABAAJABoAGgAaABoAGgAaABoAGgAeABcAFwAdABUAFQAeAB4AHgAeAB4AHgAYABYAEQAVABUAFQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgANAB4ADQANAA0ADQAeAA0ADQANAAcAHgAeAB4AHgArAAQABAAEAAQABAAEAAQABAAEAAQAUABQACsAKwBPAFAAUABQAFAAUAAeAB4AHgAWABEATwBQAE8ATwBPAE8AUABQAFAAUABQAB4AHgAeABYAEQArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAGwAbABsAGwAbABsAGwAaABsAGwAbABsAGwAbABsAGwAbABsAGwAbABsAGwAaABsAGwAbABsAGgAbABsAGgAbABsAGwAbABsAGwAbABsAGwAbABsAGwAbABsAGwAbABsABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAB4AHgBQABoAHgAdAB4AUAAeABoAHgAeAB4AHgAeAB4AHgAeAB4ATwAeAFAAGwAeAB4AUABQAFAAUABQAB4AHgAeAB0AHQAeAFAAHgBQAB4AUAAeAFAATwBQAFAAHgAeAB4AHgAeAB4AHgBQAFAAUABQAFAAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAB4AUABQAFAAUABPAE8AUABQAFAAUABQAE8AUABQAE8AUABPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBQAFAAUABQAE8ATwBPAE8ATwBPAE8ATwBPAE8AUABQAFAAUABQAFAAUABQAFAAHgAeAFAAUABQAFAATwAeAB4AKwArACsAKwAdAB0AHQAdAB0AHQAdAB0AHQAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB4AHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHQAeAB0AHQAeAB4AHgAdAB0AHgAeAB0AHgAeAB4AHQAeAB0AGwAbAB4AHQAeAB4AHgAeAB0AHgAeAB0AHQAdAB0AHgAeAB0AHgAdAB4AHQAdAB0AHQAdAB0AHgAdAB4AHgAeAB4AHgAdAB0AHQAdAB4AHgAeAB4AHQAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHQAeAB4AHgAdAB4AHgAeAB4AHgAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHQAdAB4AHgAdAB0AHQAdAB4AHgAdAB0AHgAeAB0AHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB0AHgAeAB0AHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB0AHgAeAB4AHQAeAB4AHgAeAB4AHgAeAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeABQAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAWABEAFgARAB4AHgAeAB4AHgAeAB0AHgAeAB4AHgAeAB4AHgAlACUAHgAeAB4AHgAeAB4AHgAeAB4AFgARAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACUAJQAlACUAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBQAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB4AHgAeAB4AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHgAeAB0AHQAdAB0AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB0AHgAdAB0AHQAdAB0AHQAdAB4AHgAeAB4AHgAeAB4AHgAdAB0AHgAeAB0AHQAeAB4AHgAeAB0AHQAeAB4AHgAeAB0AHQAdAB4AHgAdAB4AHgAdAB0AHQAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHQAdAB0AHQAeAB4AHgAeAB4AHgAeAB4AHgAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAeAB0AHQAeAB4AHQAeAB4AHgAeAB0AHQAeAB4AHgAeACUAJQAdAB0AJQAeACUAJQAlACAAJQAlAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AJQAlACUAHgAeAB4AHgAdAB4AHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHQAdAB4AHQAdAB0AHgAdACUAHQAdAB4AHQAdAB4AHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAlAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB0AHQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAlACUAJQAlACUAJQAlACUAHQAdAB0AHQAlAB4AJQAlACUAHQAlACUAHQAdAB0AJQAlAB0AHQAlAB0AHQAlACUAJQAeAB0AHgAeAB4AHgAdAB0AJQAdAB0AHQAdAB0AHQAlACUAJQAlACUAHQAlACUAIAAlAB0AHQAlACUAJQAlACUAJQAlACUAHgAeAB4AJQAlACAAIAAgACAAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAdAB4AHgAeABcAFwAXABcAFwAXAB4AEwATACUAHgAeAB4AFgARABYAEQAWABEAFgARABYAEQAWABEAFgARAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAWABEAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AFgARABYAEQAWABEAFgARABYAEQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeABYAEQAWABEAFgARABYAEQAWABEAFgARABYAEQAWABEAFgARABYAEQAWABEAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AFgARABYAEQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeABYAEQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHQAdAB0AHQAdAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwAeAB4AHgAeAB4AHgAeAB4AHgArACsAKwArACsAKwArACsAKwArACsAKwArAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAEAAQABAAeAB4AKwArACsAKwArABMADQANAA0AUAATAA0AUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAUAANACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAEAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXAA0ADQANAA0ADQANAA0ADQAeAA0AFgANAB4AHgAXABcAHgAeABcAFwAWABEAFgARABYAEQAWABEADQANAA0ADQATAFAADQANAB4ADQANAB4AHgAeAB4AHgAMAAwADQANAA0AHgANAA0AFgANAA0ADQANAA0ADQANACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACsAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAKwArACsAKwArACsAKwArACsAKwArACsAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAlACUAJQAlACUAJQAlACUAJQAlACUAJQArACsAKwArAA0AEQARACUAJQBHAFcAVwAWABEAFgARABYAEQAWABEAFgARACUAJQAWABEAFgARABYAEQAWABEAFQAWABEAEQAlAFcAVwBXAFcAVwBXAFcAVwBXAAQABAAEAAQABAAEACUAVwBXAFcAVwA2ACUAJQBXAFcAVwBHAEcAJQAlACUAKwBRAFcAUQBXAFEAVwBRAFcAUQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFEAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBRAFcAUQBXAFEAVwBXAFcAVwBXAFcAUQBXAFcAVwBXAFcAVwBRAFEAKwArAAQABAAVABUARwBHAFcAFQBRAFcAUQBXAFEAVwBRAFcAUQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFEAVwBRAFcAUQBXAFcAVwBXAFcAVwBRAFcAVwBXAFcAVwBXAFEAUQBXAFcAVwBXABUAUQBHAEcAVwArACsAKwArACsAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAKwArAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwArACUAJQBXAFcAVwBXACUAJQAlACUAJQAlACUAJQAlACUAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAKwArACsAKwArACUAJQAlACUAKwArACsAKwArACsAKwArACsAKwArACsAUQBRAFEAUQBRAFEAUQBRAFEAUQBRAFEAUQBRAFEAUQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACsAVwBXAFcAVwBXAFcAVwBXAFcAVwAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlAE8ATwBPAE8ATwBPAE8ATwAlAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACUAJQAlACUAJQAlACUAJQAlACUAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAEcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAKwArACsAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAADQATAA0AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABLAEsASwBLAEsASwBLAEsASwBLAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAFAABAAEAAQABAAeAAQABAAEAAQABAAEAAQABAAEAAQAHgBQAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AUABQAAQABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAeAA0ADQANAA0ADQArACsAKwArACsAKwArACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAFAAUABQAFAAUABQAFAAUABQAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAB4AHgAeAB4AHgAeAFAAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArAB4AHgAeAB4AHgAeAB4AHgArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAAQAUABQAFAABABQAFAAUABQAAQAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAeAB4AHgAeACsAKwArACsAUABQAFAAUABQAFAAHgAeABoAHgArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAADgAOABMAEwArACsAKwArACsAKwArACsABAAEAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwANAA0ASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArACsAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABABQAFAAUABQAFAAUAAeAB4AHgBQAA4AUAArACsAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAA0ADQBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAKwArACsAKwArACsAKwArACsAKwArAB4AWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYAFgAWABYACsAKwArAAQAHgAeAB4AHgAeAB4ADQANAA0AHgAeAB4AHgArAFAASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArAB4AHgBcAFwAXABcAFwAKgBcAFwAXABcAFwAXABcAFwAXABcAEsASwBLAEsASwBLAEsASwBLAEsAXABcAFwAXABcACsAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwArAFAAUABQAAQAUABQAFAAUABQAFAAUABQAAQABAArACsASwBLAEsASwBLAEsASwBLAEsASwArACsAHgANAA0ADQBcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAKgAqACoAXAAqACoAKgBcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXAAqAFwAKgAqACoAXABcACoAKgBcAFwAXABcAFwAKgAqAFwAKgBcACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFwAXABcACoAKgBQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAA0ADQBQAFAAUAAEAAQAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUAArACsAUABQAFAAUABQAFAAKwArAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQADQAEAAQAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAVABVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBUAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVAFUAVQBVACsAKwArACsAKwArACsAKwArACsAKwArAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAWQBZAFkAKwArACsAKwBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAWgBaAFoAKwArACsAKwAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYABgAGAAYAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACUAJQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAJQAlACUAJQAlACUAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAKwArACsAKwArAFYABABWAFYAVgBWAFYAVgBWAFYAVgBWAB4AVgBWAFYAVgBWAFYAVgBWAFYAVgBWAFYAVgArAFYAVgBWAFYAVgArAFYAKwBWAFYAKwBWAFYAKwBWAFYAVgBWAFYAVgBWAFYAVgBWAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAEQAWAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUAAaAB4AKwArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAGAARABEAGAAYABMAEwAWABEAFAArACsAKwArACsAKwAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACUAJQAlACUAJQAWABEAFgARABYAEQAWABEAFgARABYAEQAlACUAFgARACUAJQAlACUAJQAlACUAEQAlABEAKwAVABUAEwATACUAFgARABYAEQAWABEAJQAlACUAJQAlACUAJQAlACsAJQAbABoAJQArACsAKwArAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAAcAKwATACUAJQAbABoAJQAlABYAEQAlACUAEQAlABEAJQBXAFcAVwBXAFcAVwBXAFcAVwBXABUAFQAlACUAJQATACUAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXABYAJQARACUAJQAlAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwAWACUAEQAlABYAEQARABYAEQARABUAVwBRAFEAUQBRAFEAUQBRAFEAUQBRAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAEcARwArACsAVwBXAFcAVwBXAFcAKwArAFcAVwBXAFcAVwBXACsAKwBXAFcAVwBXAFcAVwArACsAVwBXAFcAKwArACsAGgAbACUAJQAlABsAGwArAB4AHgAeAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAKwAEAAQABAAQAB0AKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsADQANAA0AKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArAB4AHgAeAB4AHgAeAB4AHgAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgBQAFAAHgAeAB4AKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAKwArAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAAQAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsADQBQAFAAUABQACsAKwArACsAUABQAFAAUABQAFAAUABQAA0AUABQAFAAUABQACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUAArACsAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAUABQACsAKwArAFAAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAA0AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAB4AHgBQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAUABQACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsADQBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArAB4AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwBQAFAAUABQAFAABAAEAAQAKwAEAAQAKwArACsAKwArAAQABAAEAAQAUABQAFAAUAArAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsABAAEAAQAKwArACsAKwAEAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsADQANAA0ADQANAA0ADQANAB4AKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAB4AUABQAFAAUABQAFAAUABQAB4AUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEACsAKwArACsAUABQAFAAUABQAA0ADQANAA0ADQANABQAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwANAA0ADQANAA0ADQANAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAHgAeAB4AHgArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwBQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAA0ADQAeAB4AHgAeAB4AKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAEAAQABAAEAAQABAAeAB4AHgANAA0ADQANACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwBLAEsASwBLAEsASwBLAEsASwBLACsAKwArACsAKwArAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsASwBLAEsASwBLAEsASwBLAEsASwANAA0ADQANACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAeAA4AUAArACsAKwArACsAKwArACsAKwAEAFAAUABQAFAADQANAB4ADQAeAAQABAAEAB4AKwArAEsASwBLAEsASwBLAEsASwBLAEsAUAAOAFAADQANAA0AKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAANAA0AHgANAA0AHgAEACsAUABQAFAAUABQAFAAUAArAFAAKwBQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAA0AKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsABAAEAAQABAArAFAAUABQAFAAUABQAFAAUAArACsAUABQACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAArACsABAAEACsAKwAEAAQABAArACsAUAArACsAKwArACsAKwAEACsAKwArACsAKwBQAFAAUABQAFAABAAEACsAKwAEAAQABAAEAAQABAAEACsAKwArAAQABAAEAAQABAArACsAKwArACsAKwArACsAKwArACsABAAEAAQABAAEAAQABABQAFAAUABQAA0ADQANAA0AHgBLAEsASwBLAEsASwBLAEsASwBLACsADQArAB4AKwArAAQABAAEAAQAUABQAB4AUAArACsAKwArACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEACsAKwAEAAQABAAEAAQABAAEAAQABAAOAA0ADQATABMAHgAeAB4ADQANAA0ADQANAA0ADQANAA0ADQANAA0ADQANAA0AUABQAFAAUAAEAAQAKwArAAQADQANAB4AUAArACsAKwArACsAKwArACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArACsAKwAOAA4ADgAOAA4ADgAOAA4ADgAOAA4ADgAOACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXABcAFwAXAArACsAKwAqACoAKgAqACoAKgAqACoAKgAqACoAKgAqACoAKgArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAXABcAA0ADQANACoASwBLAEsASwBLAEsASwBLAEsASwBQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwBQAFAABAAEAAQABAAEAAQABAAEAAQABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAFAABAAEAAQABAAOAB4ADQANAA0ADQAOAB4ABAArACsAKwArACsAKwArACsAUAAEAAQABAAEAAQABAAEAAQABAAEAAQAUABQAFAAUAArACsAUABQAFAAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAA0ADQANACsADgAOAA4ADQANACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAABAAEAAQABAAEAAQABAAEACsABAAEAAQABAAEAAQABAAEAFAADQANAA0ADQANACsAKwArACsAKwArACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwAOABMAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQACsAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAArACsAKwAEACsABAAEACsABAAEAAQABAAEAAQABABQAAQAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsADQANAA0ADQANACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAASABIAEgAQwBDAEMAUABQAFAAUABDAFAAUABQAEgAQwBIAEMAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAASABDAEMAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABIAEMAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAEsASwBLAEsASwBLAEsASwBLAEsAKwArACsAKwANAA0AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArAAQABAAEAAQABAANACsAKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAEAAQABAAEAAQABAAEAA0ADQANAB4AHgAeAB4AHgAeAFAAUABQAFAADQAeACsAKwArACsAKwArACsAKwArACsASwBLAEsASwBLAEsASwBLAEsASwArAFAAUABQAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAUAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsABAAEAAQABABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAEcARwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwArACsAKwArACsAKwArACsAKwArACsAKwArAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwBQAFAAUABQAFAAUABQAFAAUABQACsAKwAeAAQABAANAAQABAAEAAQAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACsAKwArACsAKwArACsAKwArACsAHgAeAB4AHgAeAB4AHgArACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAAEAAQABAAEAB4AHgAeAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQAHgAeAAQABAAEAAQABAAEAAQAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAEAAQABAAEAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAB4AHgAEAAQABAAeACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwArACsAKwArACsAKwArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAKwArACsAKwArACsAKwArACsAKwArACsAKwArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArAFAAUAArACsAUAArACsAUABQACsAKwBQAFAAUABQACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AKwBQACsAUABQAFAAUABQAFAAUAArAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAKwAeAB4AUABQAFAAUABQACsAUAArACsAKwBQAFAAUABQAFAAUABQACsAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgArACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAFAAUABQAFAAUABQAFAAUABQAFAAUAAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAHgAeAB4AHgAeAB4AHgAeAB4AKwArAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsASwBLAEsABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAB4AHgAeAB4ABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAB4AHgAeAB4AHgAeAB4AHgAEAB4AHgAeAB4AHgAeAB4AHgAeAB4ABAAeAB4ADQANAA0ADQAeACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAAQABAAEAAQABAArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsABAAEAAQABAAEAAQABAArAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArACsABAAEAAQABAAEAAQABAArAAQABAArAAQABAAEAAQABAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwBQAFAAUABQAFAAKwArAFAAUABQAFAAUABQAFAAUABQAAQABAAEAAQABAAEAAQAKwArACsAKwArACsAKwArACsAHgAeAB4AHgAEAAQABAAEAAQABAAEACsAKwArACsAKwBLAEsASwBLAEsASwBLAEsASwBLACsAKwArACsAFgAWAFAAUABQAFAAKwBQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArAFAAUAArAFAAKwArAFAAKwBQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUAArAFAAKwBQACsAKwArACsAKwArAFAAKwArACsAKwBQACsAUAArAFAAKwBQAFAAUAArAFAAUAArAFAAKwArAFAAKwBQACsAUAArAFAAKwBQACsAUABQACsAUAArACsAUABQAFAAUAArAFAAUABQAFAAUABQAFAAKwBQAFAAUABQACsAUABQAFAAUAArAFAAKwBQAFAAUABQAFAAUABQAFAAUABQACsAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQACsAKwArACsAKwBQAFAAUAArAFAAUABQAFAAUAArAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUABQAFAAUAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArAB4AHgArACsAKwArACsAKwArACsAKwArACsAKwArACsATwBPAE8ATwBPAE8ATwBPAE8ATwBPAE8ATwAlACUAJQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAeACUAHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHgAeACUAJQAlACUAHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdAB0AHQAdACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACkAKQApACkAKQApACkAKQApACkAKQApACkAKQApACkAKQApACkAKQApACkAKQApACkAKQAlACUAJQAlACUAIAAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlAB4AHgAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAHgAeACUAJQAlACUAJQAeACUAJQAlACUAJQAgACAAIAAlACUAIAAlACUAIAAgACAAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAIQAhACEAIQAhACUAJQAgACAAJQAlACAAIAAgACAAIAAgACAAIAAgACAAIAAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAIAAgACAAIAAlACUAJQAlACAAJQAgACAAIAAgACAAIAAgACAAIAAlACUAJQAgACUAJQAlACUAIAAgACAAJQAgACAAIAAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAeACUAHgAlAB4AJQAlACUAJQAlACAAJQAlACUAJQAeACUAHgAeACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAHgAeAB4AHgAeAB4AHgAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlAB4AHgAeAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAIAAgACUAJQAlACUAIAAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAIAAlACUAJQAlACAAIAAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAeAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlAB4AHgAeAB4AHgAeACUAJQAlACUAJQAlACUAIAAgACAAJQAlACUAIAAgACAAIAAgAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AFwAXABcAFQAVABUAHgAeAB4AHgAlACUAJQAgACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAIAAgACAAJQAlACUAJQAlACUAJQAlACUAIAAlACUAJQAlACUAJQAlACUAJQAlACUAIAAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAlACUAJQAlACUAJQAlACUAJQAlACUAJQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAlACUAJQAlAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAlACUAJQAlAB4AHgAeAB4AHgAeAB4AHgAeAB4AJQAlACUAJQAlACUAHgAeAB4AHgAeAB4AHgAeACUAJQAlACUAJQAlACUAJQAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeAB4AHgAeACUAJQAlACUAJQAlACUAJQAlACUAJQAlACAAIAAgACAAIAAlACAAIAAlACUAJQAlACUAJQAgACUAJQAlACUAJQAlACUAJQAlACAAIAAgACAAIAAgACAAIAAgACAAJQAlACUAIAAgACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACAAIAAgACAAIAAgACAAIAAgACAAIAAgACAAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACsAKwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAJQAlACUAJQAlACUAJQAlACUAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAJQAlACUAJQAlACUAJQAlACUAJQAlAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAVwBXAFcAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQAlACUAJQArAAQAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAAEAAQABAArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsAKwArACsA';

        /* @flow */
        var LETTER_NUMBER_MODIFIER = 50;
        // Non-tailorable Line Breaking Classes
        var BK = 1; //  Cause a line break (after)
        var CR = 2; //  Cause a line break (after), except between CR and LF
        var LF = 3; //  Cause a line break (after)
        var CM = 4; //  Prohibit a line break between the character and the preceding character
        var NL = 5; //  Cause a line break (after)
        var WJ = 7; //  Prohibit line breaks before and after
        var ZW = 8; //  Provide a break opportunity
        var GL = 9; //  Prohibit line breaks before and after
        var SP = 10; // Enable indirect line breaks
        var ZWJ = 11; // Prohibit line breaks within joiner sequences
        // Break Opportunities
        var B2 = 12; //  Provide a line break opportunity before and after the character
        var BA = 13; //  Generally provide a line break opportunity after the character
        var BB = 14; //  Generally provide a line break opportunity before the character
        var HY = 15; //  Provide a line break opportunity after the character, except in numeric context
        var CB = 16; //   Provide a line break opportunity contingent on additional information
        // Characters Prohibiting Certain Breaks
        var CL = 17; //  Prohibit line breaks before
        var CP = 18; //  Prohibit line breaks before
        var EX = 19; //  Prohibit line breaks before
        var IN = 20; //  Allow only indirect line breaks between pairs
        var NS = 21; //  Allow only indirect line breaks before
        var OP = 22; //  Prohibit line breaks after
        var QU = 23; //  Act like they are both opening and closing
        // Numeric Context
        var IS = 24; //  Prevent breaks after any and before numeric
        var NU = 25; //  Form numeric expressions for line breaking purposes
        var PO = 26; //  Do not break following a numeric expression
        var PR = 27; //  Do not break in front of a numeric expression
        var SY = 28; //  Prevent a break before; and allow a break after
        // Other Characters
        var AI = 29; //  Act like AL when the resolvedEAW is N; otherwise; act as ID
        var AL = 30; //  Are alphabetic characters or symbols that are used with alphabetic characters
        var CJ = 31; //  Treat as NS or ID for strict or normal breaking.
        var EB = 32; //  Do not break from following Emoji Modifier
        var EM = 33; //  Do not break from preceding Emoji Base
        var H2 = 34; //  Form Korean syllable blocks
        var H3 = 35; //  Form Korean syllable blocks
        var HL = 36; //  Do not break around a following hyphen; otherwise act as Alphabetic
        var ID = 37; //  Break before or after; except in some numeric context
        var JL = 38; //  Form Korean syllable blocks
        var JV = 39; //  Form Korean syllable blocks
        var JT = 40; //  Form Korean syllable blocks
        var RI = 41; //  Keep pairs together. For pairs; break before and after other classes
        var SA = 42; //  Provide a line break opportunity contingent on additional, language-specific context analysis
        var XX = 43; //  Have as yet unknown line breaking behavior or unassigned code positions
        var BREAK_MANDATORY = '!';
        var BREAK_NOT_ALLOWED = '×';
        var BREAK_ALLOWED = '÷';
        var UnicodeTrie = createTrieFromBase64(base64);
        var ALPHABETICS = [AL, HL];
        var HARD_LINE_BREAKS = [BK, CR, LF, NL];
        var SPACE = [SP, ZW];
        var PREFIX_POSTFIX = [PR, PO];
        var LINE_BREAKS = HARD_LINE_BREAKS.concat(SPACE);
        var KOREAN_SYLLABLE_BLOCK = [JL, JV, JT, H2, H3];
        var HYPHEN = [HY, BA];
        var codePointsToCharacterClasses = function (codePoints, lineBreak) {
            if (lineBreak === void 0) { lineBreak = 'strict'; }
            var types = [];
            var indicies = [];
            var categories = [];
            codePoints.forEach(function (codePoint, index) {
                var classType = UnicodeTrie.get(codePoint);
                if (classType > LETTER_NUMBER_MODIFIER) {
                    categories.push(true);
                    classType -= LETTER_NUMBER_MODIFIER;
                }
                else {
                    categories.push(false);
                }
                if (['normal', 'auto', 'loose'].indexOf(lineBreak) !== -1) {
                    // U+2010, – U+2013, 〜 U+301C, ゠ U+30A0
                    if ([0x2010, 0x2013, 0x301c, 0x30a0].indexOf(codePoint) !== -1) {
                        indicies.push(index);
                        return types.push(CB);
                    }
                }
                if (classType === CM || classType === ZWJ) {
                    // LB10 Treat any remaining combining mark or ZWJ as AL.
                    if (index === 0) {
                        indicies.push(index);
                        return types.push(AL);
                    }
                    // LB9 Do not break a combining character sequence; treat it as if it has the line breaking class of
                    // the base character in all of the following rules. Treat ZWJ as if it were CM.
                    var prev = types[index - 1];
                    if (LINE_BREAKS.indexOf(prev) === -1) {
                        indicies.push(indicies[index - 1]);
                        return types.push(prev);
                    }
                    indicies.push(index);
                    return types.push(AL);
                }
                indicies.push(index);
                if (classType === CJ) {
                    return types.push(lineBreak === 'strict' ? NS : ID);
                }
                if (classType === SA) {
                    return types.push(AL);
                }
                if (classType === AI) {
                    return types.push(AL);
                }
                // For supplementary characters, a useful default is to treat characters in the range 10000..1FFFD as AL
                // and characters in the ranges 20000..2FFFD and 30000..3FFFD as ID, until the implementation can be revised
                // to take into account the actual line breaking properties for these characters.
                if (classType === XX) {
                    if ((codePoint >= 0x20000 && codePoint <= 0x2fffd) || (codePoint >= 0x30000 && codePoint <= 0x3fffd)) {
                        return types.push(ID);
                    }
                    else {
                        return types.push(AL);
                    }
                }
                types.push(classType);
            });
            return [indicies, types, categories];
        };
        var isAdjacentWithSpaceIgnored = function (a, b, currentIndex, classTypes) {
            var current = classTypes[currentIndex];
            if (Array.isArray(a) ? a.indexOf(current) !== -1 : a === current) {
                var i = currentIndex;
                while (i <= classTypes.length) {
                    i++;
                    var next = classTypes[i];
                    if (next === b) {
                        return true;
                    }
                    if (next !== SP) {
                        break;
                    }
                }
            }
            if (current === SP) {
                var i = currentIndex;
                while (i > 0) {
                    i--;
                    var prev = classTypes[i];
                    if (Array.isArray(a) ? a.indexOf(prev) !== -1 : a === prev) {
                        var n = currentIndex;
                        while (n <= classTypes.length) {
                            n++;
                            var next = classTypes[n];
                            if (next === b) {
                                return true;
                            }
                            if (next !== SP) {
                                break;
                            }
                        }
                    }
                    if (prev !== SP) {
                        break;
                    }
                }
            }
            return false;
        };
        var previousNonSpaceClassType = function (currentIndex, classTypes) {
            var i = currentIndex;
            while (i >= 0) {
                var type = classTypes[i];
                if (type === SP) {
                    i--;
                }
                else {
                    return type;
                }
            }
            return 0;
        };
        var _lineBreakAtIndex = function (codePoints, classTypes, indicies, index, forbiddenBreaks) {
            if (indicies[index] === 0) {
                return BREAK_NOT_ALLOWED;
            }
            var currentIndex = index - 1;
            if (Array.isArray(forbiddenBreaks) && forbiddenBreaks[currentIndex] === true) {
                return BREAK_NOT_ALLOWED;
            }
            var beforeIndex = currentIndex - 1;
            var afterIndex = currentIndex + 1;
            var current = classTypes[currentIndex];
            // LB4 Always break after hard line breaks.
            // LB5 Treat CR followed by LF, as well as CR, LF, and NL as hard line breaks.
            var before = beforeIndex >= 0 ? classTypes[beforeIndex] : 0;
            var next = classTypes[afterIndex];
            if (current === CR && next === LF) {
                return BREAK_NOT_ALLOWED;
            }
            if (HARD_LINE_BREAKS.indexOf(current) !== -1) {
                return BREAK_MANDATORY;
            }
            // LB6 Do not break before hard line breaks.
            if (HARD_LINE_BREAKS.indexOf(next) !== -1) {
                return BREAK_NOT_ALLOWED;
            }
            // LB7 Do not break before spaces or zero width space.
            if (SPACE.indexOf(next) !== -1) {
                return BREAK_NOT_ALLOWED;
            }
            // LB8 Break before any character following a zero-width space, even if one or more spaces intervene.
            if (previousNonSpaceClassType(currentIndex, classTypes) === ZW) {
                return BREAK_ALLOWED;
            }
            // LB8a Do not break between a zero width joiner and an ideograph, emoji base or emoji modifier.
            if (UnicodeTrie.get(codePoints[currentIndex]) === ZWJ && (next === ID || next === EB || next === EM)) {
                return BREAK_NOT_ALLOWED;
            }
            // LB11 Do not break before or after Word joiner and related characters.
            if (current === WJ || next === WJ) {
                return BREAK_NOT_ALLOWED;
            }
            // LB12 Do not break after NBSP and related characters.
            if (current === GL) {
                return BREAK_NOT_ALLOWED;
            }
            // LB12a Do not break before NBSP and related characters, except after spaces and hyphens.
            if ([SP, BA, HY].indexOf(current) === -1 && next === GL) {
                return BREAK_NOT_ALLOWED;
            }
            // LB13 Do not break before ‘]’ or ‘!’ or ‘;’ or ‘/’, even after spaces.
            if ([CL, CP, EX, IS, SY].indexOf(next) !== -1) {
                return BREAK_NOT_ALLOWED;
            }
            // LB14 Do not break after ‘[’, even after spaces.
            if (previousNonSpaceClassType(currentIndex, classTypes) === OP) {
                return BREAK_NOT_ALLOWED;
            }
            // LB15 Do not break within ‘”[’, even with intervening spaces.
            if (isAdjacentWithSpaceIgnored(QU, OP, currentIndex, classTypes)) {
                return BREAK_NOT_ALLOWED;
            }
            // LB16 Do not break between closing punctuation and a nonstarter (lb=NS), even with intervening spaces.
            if (isAdjacentWithSpaceIgnored([CL, CP], NS, currentIndex, classTypes)) {
                return BREAK_NOT_ALLOWED;
            }
            // LB17 Do not break within ‘——’, even with intervening spaces.
            if (isAdjacentWithSpaceIgnored(B2, B2, currentIndex, classTypes)) {
                return BREAK_NOT_ALLOWED;
            }
            // LB18 Break after spaces.
            if (current === SP) {
                return BREAK_ALLOWED;
            }
            // LB19 Do not break before or after quotation marks, such as ‘ ” ’.
            if (current === QU || next === QU) {
                return BREAK_NOT_ALLOWED;
            }
            // LB20 Break before and after unresolved CB.
            if (next === CB || current === CB) {
                return BREAK_ALLOWED;
            }
            // LB21 Do not break before hyphen-minus, other hyphens, fixed-width spaces, small kana, and other non-starters, or after acute accents.
            if ([BA, HY, NS].indexOf(next) !== -1 || current === BB) {
                return BREAK_NOT_ALLOWED;
            }
            // LB21a Don't break after Hebrew + Hyphen.
            if (before === HL && HYPHEN.indexOf(current) !== -1) {
                return BREAK_NOT_ALLOWED;
            }
            // LB21b Don’t break between Solidus and Hebrew letters.
            if (current === SY && next === HL) {
                return BREAK_NOT_ALLOWED;
            }
            // LB22 Do not break between two ellipses, or between letters, numbers or exclamations and ellipsis.
            if (next === IN && ALPHABETICS.concat(IN, EX, NU, ID, EB, EM).indexOf(current) !== -1) {
                return BREAK_NOT_ALLOWED;
            }
            // LB23 Do not break between digits and letters.
            if ((ALPHABETICS.indexOf(next) !== -1 && current === NU) || (ALPHABETICS.indexOf(current) !== -1 && next === NU)) {
                return BREAK_NOT_ALLOWED;
            }
            // LB23a Do not break between numeric prefixes and ideographs, or between ideographs and numeric postfixes.
            if ((current === PR && [ID, EB, EM].indexOf(next) !== -1) ||
                ([ID, EB, EM].indexOf(current) !== -1 && next === PO)) {
                return BREAK_NOT_ALLOWED;
            }
            // LB24 Do not break between numeric prefix/postfix and letters, or between letters and prefix/postfix.
            if ((ALPHABETICS.indexOf(current) !== -1 && PREFIX_POSTFIX.indexOf(next) !== -1) ||
                (PREFIX_POSTFIX.indexOf(current) !== -1 && ALPHABETICS.indexOf(next) !== -1)) {
                return BREAK_NOT_ALLOWED;
            }
            // LB25 Do not break between the following pairs of classes relevant to numbers:
            if (
            // (PR | PO) × ( OP | HY )? NU
            ([PR, PO].indexOf(current) !== -1 &&
                (next === NU || ([OP, HY].indexOf(next) !== -1 && classTypes[afterIndex + 1] === NU))) ||
                // ( OP | HY ) × NU
                ([OP, HY].indexOf(current) !== -1 && next === NU) ||
                // NU ×	(NU | SY | IS)
                (current === NU && [NU, SY, IS].indexOf(next) !== -1)) {
                return BREAK_NOT_ALLOWED;
            }
            // NU (NU | SY | IS)* × (NU | SY | IS | CL | CP)
            if ([NU, SY, IS, CL, CP].indexOf(next) !== -1) {
                var prevIndex = currentIndex;
                while (prevIndex >= 0) {
                    var type = classTypes[prevIndex];
                    if (type === NU) {
                        return BREAK_NOT_ALLOWED;
                    }
                    else if ([SY, IS].indexOf(type) !== -1) {
                        prevIndex--;
                    }
                    else {
                        break;
                    }
                }
            }
            // NU (NU | SY | IS)* (CL | CP)? × (PO | PR))
            if ([PR, PO].indexOf(next) !== -1) {
                var prevIndex = [CL, CP].indexOf(current) !== -1 ? beforeIndex : currentIndex;
                while (prevIndex >= 0) {
                    var type = classTypes[prevIndex];
                    if (type === NU) {
                        return BREAK_NOT_ALLOWED;
                    }
                    else if ([SY, IS].indexOf(type) !== -1) {
                        prevIndex--;
                    }
                    else {
                        break;
                    }
                }
            }
            // LB26 Do not break a Korean syllable.
            if ((JL === current && [JL, JV, H2, H3].indexOf(next) !== -1) ||
                ([JV, H2].indexOf(current) !== -1 && [JV, JT].indexOf(next) !== -1) ||
                ([JT, H3].indexOf(current) !== -1 && next === JT)) {
                return BREAK_NOT_ALLOWED;
            }
            // LB27 Treat a Korean Syllable Block the same as ID.
            if ((KOREAN_SYLLABLE_BLOCK.indexOf(current) !== -1 && [IN, PO].indexOf(next) !== -1) ||
                (KOREAN_SYLLABLE_BLOCK.indexOf(next) !== -1 && current === PR)) {
                return BREAK_NOT_ALLOWED;
            }
            // LB28 Do not break between alphabetics (“at”).
            if (ALPHABETICS.indexOf(current) !== -1 && ALPHABETICS.indexOf(next) !== -1) {
                return BREAK_NOT_ALLOWED;
            }
            // LB29 Do not break between numeric punctuation and alphabetics (“e.g.”).
            if (current === IS && ALPHABETICS.indexOf(next) !== -1) {
                return BREAK_NOT_ALLOWED;
            }
            // LB30 Do not break between letters, numbers, or ordinary symbols and opening or closing parentheses.
            if ((ALPHABETICS.concat(NU).indexOf(current) !== -1 && next === OP) ||
                (ALPHABETICS.concat(NU).indexOf(next) !== -1 && current === CP)) {
                return BREAK_NOT_ALLOWED;
            }
            // LB30a Break between two regional indicator symbols if and only if there are an even number of regional
            // indicators preceding the position of the break.
            if (current === RI && next === RI) {
                var i = indicies[currentIndex];
                var count = 1;
                while (i > 0) {
                    i--;
                    if (classTypes[i] === RI) {
                        count++;
                    }
                    else {
                        break;
                    }
                }
                if (count % 2 !== 0) {
                    return BREAK_NOT_ALLOWED;
                }
            }
            // LB30b Do not break between an emoji base and an emoji modifier.
            if (current === EB && next === EM) {
                return BREAK_NOT_ALLOWED;
            }
            return BREAK_ALLOWED;
        };
        var cssFormattedClasses = function (codePoints, options) {
            if (!options) {
                options = { lineBreak: 'normal', wordBreak: 'normal' };
            }
            var _a = codePointsToCharacterClasses(codePoints, options.lineBreak), indicies = _a[0], classTypes = _a[1], isLetterNumber = _a[2];
            if (options.wordBreak === 'break-all' || options.wordBreak === 'break-word') {
                classTypes = classTypes.map(function (type) { return ([NU, AL, SA].indexOf(type) !== -1 ? ID : type); });
            }
            var forbiddenBreakpoints = options.wordBreak === 'keep-all'
                ? isLetterNumber.map(function (letterNumber, i) {
                    return letterNumber && codePoints[i] >= 0x4e00 && codePoints[i] <= 0x9fff;
                })
                : undefined;
            return [indicies, classTypes, forbiddenBreakpoints];
        };
        var Break = /** @class */ (function () {
            function Break(codePoints, lineBreak, start, end) {
                this.codePoints = codePoints;
                this.required = lineBreak === BREAK_MANDATORY;
                this.start = start;
                this.end = end;
            }
            Break.prototype.slice = function () {
                return fromCodePoint.apply(void 0, this.codePoints.slice(this.start, this.end));
            };
            return Break;
        }());
        var LineBreaker = function (str, options) {
            var codePoints = toCodePoints(str);
            var _a = cssFormattedClasses(codePoints, options), indicies = _a[0], classTypes = _a[1], forbiddenBreakpoints = _a[2];
            var length = codePoints.length;
            var lastEnd = 0;
            var nextIndex = 0;
            return {
                next: function () {
                    if (nextIndex >= length) {
                        return { done: true, value: null };
                    }
                    var lineBreak = BREAK_NOT_ALLOWED;
                    while (nextIndex < length &&
                        (lineBreak = _lineBreakAtIndex(codePoints, classTypes, indicies, ++nextIndex, forbiddenBreakpoints)) ===
                            BREAK_NOT_ALLOWED) { }
                    if (lineBreak !== BREAK_NOT_ALLOWED || nextIndex === length) {
                        var value = new Break(codePoints, lineBreak, lastEnd, nextIndex);
                        lastEnd = nextIndex;
                        return { value: value, done: false };
                    }
                    return { done: true, value: null };
                },
            };
        };

        // https://www.w3.org/TR/css-syntax-3
        var TokenType;
        (function (TokenType) {
            TokenType[TokenType["STRING_TOKEN"] = 0] = "STRING_TOKEN";
            TokenType[TokenType["BAD_STRING_TOKEN"] = 1] = "BAD_STRING_TOKEN";
            TokenType[TokenType["LEFT_PARENTHESIS_TOKEN"] = 2] = "LEFT_PARENTHESIS_TOKEN";
            TokenType[TokenType["RIGHT_PARENTHESIS_TOKEN"] = 3] = "RIGHT_PARENTHESIS_TOKEN";
            TokenType[TokenType["COMMA_TOKEN"] = 4] = "COMMA_TOKEN";
            TokenType[TokenType["HASH_TOKEN"] = 5] = "HASH_TOKEN";
            TokenType[TokenType["DELIM_TOKEN"] = 6] = "DELIM_TOKEN";
            TokenType[TokenType["AT_KEYWORD_TOKEN"] = 7] = "AT_KEYWORD_TOKEN";
            TokenType[TokenType["PREFIX_MATCH_TOKEN"] = 8] = "PREFIX_MATCH_TOKEN";
            TokenType[TokenType["DASH_MATCH_TOKEN"] = 9] = "DASH_MATCH_TOKEN";
            TokenType[TokenType["INCLUDE_MATCH_TOKEN"] = 10] = "INCLUDE_MATCH_TOKEN";
            TokenType[TokenType["LEFT_CURLY_BRACKET_TOKEN"] = 11] = "LEFT_CURLY_BRACKET_TOKEN";
            TokenType[TokenType["RIGHT_CURLY_BRACKET_TOKEN"] = 12] = "RIGHT_CURLY_BRACKET_TOKEN";
            TokenType[TokenType["SUFFIX_MATCH_TOKEN"] = 13] = "SUFFIX_MATCH_TOKEN";
            TokenType[TokenType["SUBSTRING_MATCH_TOKEN"] = 14] = "SUBSTRING_MATCH_TOKEN";
            TokenType[TokenType["DIMENSION_TOKEN"] = 15] = "DIMENSION_TOKEN";
            TokenType[TokenType["PERCENTAGE_TOKEN"] = 16] = "PERCENTAGE_TOKEN";
            TokenType[TokenType["NUMBER_TOKEN"] = 17] = "NUMBER_TOKEN";
            TokenType[TokenType["FUNCTION"] = 18] = "FUNCTION";
            TokenType[TokenType["FUNCTION_TOKEN"] = 19] = "FUNCTION_TOKEN";
            TokenType[TokenType["IDENT_TOKEN"] = 20] = "IDENT_TOKEN";
            TokenType[TokenType["COLUMN_TOKEN"] = 21] = "COLUMN_TOKEN";
            TokenType[TokenType["URL_TOKEN"] = 22] = "URL_TOKEN";
            TokenType[TokenType["BAD_URL_TOKEN"] = 23] = "BAD_URL_TOKEN";
            TokenType[TokenType["CDC_TOKEN"] = 24] = "CDC_TOKEN";
            TokenType[TokenType["CDO_TOKEN"] = 25] = "CDO_TOKEN";
            TokenType[TokenType["COLON_TOKEN"] = 26] = "COLON_TOKEN";
            TokenType[TokenType["SEMICOLON_TOKEN"] = 27] = "SEMICOLON_TOKEN";
            TokenType[TokenType["LEFT_SQUARE_BRACKET_TOKEN"] = 28] = "LEFT_SQUARE_BRACKET_TOKEN";
            TokenType[TokenType["RIGHT_SQUARE_BRACKET_TOKEN"] = 29] = "RIGHT_SQUARE_BRACKET_TOKEN";
            TokenType[TokenType["UNICODE_RANGE_TOKEN"] = 30] = "UNICODE_RANGE_TOKEN";
            TokenType[TokenType["WHITESPACE_TOKEN"] = 31] = "WHITESPACE_TOKEN";
            TokenType[TokenType["EOF_TOKEN"] = 32] = "EOF_TOKEN";
        })(TokenType || (TokenType = {}));
        var FLAG_UNRESTRICTED = 1 << 0;
        var FLAG_ID = 1 << 1;
        var FLAG_INTEGER = 1 << 2;
        var FLAG_NUMBER = 1 << 3;
        var LINE_FEED = 0x000a;
        var SOLIDUS = 0x002f;
        var REVERSE_SOLIDUS = 0x005c;
        var CHARACTER_TABULATION = 0x0009;
        var SPACE$1 = 0x0020;
        var QUOTATION_MARK = 0x0022;
        var EQUALS_SIGN = 0x003d;
        var NUMBER_SIGN = 0x0023;
        var DOLLAR_SIGN = 0x0024;
        var PERCENTAGE_SIGN = 0x0025;
        var APOSTROPHE = 0x0027;
        var LEFT_PARENTHESIS = 0x0028;
        var RIGHT_PARENTHESIS = 0x0029;
        var LOW_LINE = 0x005f;
        var HYPHEN_MINUS = 0x002d;
        var EXCLAMATION_MARK = 0x0021;
        var LESS_THAN_SIGN = 0x003c;
        var GREATER_THAN_SIGN = 0x003e;
        var COMMERCIAL_AT = 0x0040;
        var LEFT_SQUARE_BRACKET = 0x005b;
        var RIGHT_SQUARE_BRACKET = 0x005d;
        var CIRCUMFLEX_ACCENT = 0x003d;
        var LEFT_CURLY_BRACKET = 0x007b;
        var QUESTION_MARK = 0x003f;
        var RIGHT_CURLY_BRACKET = 0x007d;
        var VERTICAL_LINE = 0x007c;
        var TILDE = 0x007e;
        var CONTROL = 0x0080;
        var REPLACEMENT_CHARACTER = 0xfffd;
        var ASTERISK = 0x002a;
        var PLUS_SIGN = 0x002b;
        var COMMA = 0x002c;
        var COLON = 0x003a;
        var SEMICOLON = 0x003b;
        var FULL_STOP = 0x002e;
        var NULL = 0x0000;
        var BACKSPACE = 0x0008;
        var LINE_TABULATION = 0x000b;
        var SHIFT_OUT = 0x000e;
        var INFORMATION_SEPARATOR_ONE = 0x001f;
        var DELETE = 0x007f;
        var EOF = -1;
        var ZERO = 0x0030;
        var a = 0x0061;
        var e = 0x0065;
        var f = 0x0066;
        var u = 0x0075;
        var z = 0x007a;
        var A = 0x0041;
        var E = 0x0045;
        var F = 0x0046;
        var U = 0x0055;
        var Z = 0x005a;
        var isDigit = function (codePoint) { return codePoint >= ZERO && codePoint <= 0x0039; };
        var isSurrogateCodePoint = function (codePoint) { return codePoint >= 0xd800 && codePoint <= 0xdfff; };
        var isHex = function (codePoint) {
            return isDigit(codePoint) || (codePoint >= A && codePoint <= F) || (codePoint >= a && codePoint <= f);
        };
        var isLowerCaseLetter = function (codePoint) { return codePoint >= a && codePoint <= z; };
        var isUpperCaseLetter = function (codePoint) { return codePoint >= A && codePoint <= Z; };
        var isLetter = function (codePoint) { return isLowerCaseLetter(codePoint) || isUpperCaseLetter(codePoint); };
        var isNonASCIICodePoint = function (codePoint) { return codePoint >= CONTROL; };
        var isWhiteSpace = function (codePoint) {
            return codePoint === LINE_FEED || codePoint === CHARACTER_TABULATION || codePoint === SPACE$1;
        };
        var isNameStartCodePoint = function (codePoint) {
            return isLetter(codePoint) || isNonASCIICodePoint(codePoint) || codePoint === LOW_LINE;
        };
        var isNameCodePoint = function (codePoint) {
            return isNameStartCodePoint(codePoint) || isDigit(codePoint) || codePoint === HYPHEN_MINUS;
        };
        var isNonPrintableCodePoint = function (codePoint) {
            return ((codePoint >= NULL && codePoint <= BACKSPACE) ||
                codePoint === LINE_TABULATION ||
                (codePoint >= SHIFT_OUT && codePoint <= INFORMATION_SEPARATOR_ONE) ||
                codePoint === DELETE);
        };
        var isValidEscape = function (c1, c2) {
            if (c1 !== REVERSE_SOLIDUS) {
                return false;
            }
            return c2 !== LINE_FEED;
        };
        var isIdentifierStart = function (c1, c2, c3) {
            if (c1 === HYPHEN_MINUS) {
                return isNameStartCodePoint(c2) || isValidEscape(c2, c3);
            }
            else if (isNameStartCodePoint(c1)) {
                return true;
            }
            else if (c1 === REVERSE_SOLIDUS && isValidEscape(c1, c2)) {
                return true;
            }
            return false;
        };
        var isNumberStart = function (c1, c2, c3) {
            if (c1 === PLUS_SIGN || c1 === HYPHEN_MINUS) {
                if (isDigit(c2)) {
                    return true;
                }
                return c2 === FULL_STOP && isDigit(c3);
            }
            if (c1 === FULL_STOP) {
                return isDigit(c2);
            }
            return isDigit(c1);
        };
        var stringToNumber = function (codePoints) {
            var c = 0;
            var sign = 1;
            if (codePoints[c] === PLUS_SIGN || codePoints[c] === HYPHEN_MINUS) {
                if (codePoints[c] === HYPHEN_MINUS) {
                    sign = -1;
                }
                c++;
            }
            var integers = [];
            while (isDigit(codePoints[c])) {
                integers.push(codePoints[c++]);
            }
            var int = integers.length ? parseInt(fromCodePoint.apply(void 0, integers), 10) : 0;
            if (codePoints[c] === FULL_STOP) {
                c++;
            }
            var fraction = [];
            while (isDigit(codePoints[c])) {
                fraction.push(codePoints[c++]);
            }
            var fracd = fraction.length;
            var frac = fracd ? parseInt(fromCodePoint.apply(void 0, fraction), 10) : 0;
            if (codePoints[c] === E || codePoints[c] === e) {
                c++;
            }
            var expsign = 1;
            if (codePoints[c] === PLUS_SIGN || codePoints[c] === HYPHEN_MINUS) {
                if (codePoints[c] === HYPHEN_MINUS) {
                    expsign = -1;
                }
                c++;
            }
            var exponent = [];
            while (isDigit(codePoints[c])) {
                exponent.push(codePoints[c++]);
            }
            var exp = exponent.length ? parseInt(fromCodePoint.apply(void 0, exponent), 10) : 0;
            return sign * (int + frac * Math.pow(10, -fracd)) * Math.pow(10, expsign * exp);
        };
        var LEFT_PARENTHESIS_TOKEN = {
            type: TokenType.LEFT_PARENTHESIS_TOKEN
        };
        var RIGHT_PARENTHESIS_TOKEN = {
            type: TokenType.RIGHT_PARENTHESIS_TOKEN
        };
        var COMMA_TOKEN = { type: TokenType.COMMA_TOKEN };
        var SUFFIX_MATCH_TOKEN = { type: TokenType.SUFFIX_MATCH_TOKEN };
        var PREFIX_MATCH_TOKEN = { type: TokenType.PREFIX_MATCH_TOKEN };
        var COLUMN_TOKEN = { type: TokenType.COLUMN_TOKEN };
        var DASH_MATCH_TOKEN = { type: TokenType.DASH_MATCH_TOKEN };
        var INCLUDE_MATCH_TOKEN = { type: TokenType.INCLUDE_MATCH_TOKEN };
        var LEFT_CURLY_BRACKET_TOKEN = {
            type: TokenType.LEFT_CURLY_BRACKET_TOKEN
        };
        var RIGHT_CURLY_BRACKET_TOKEN = {
            type: TokenType.RIGHT_CURLY_BRACKET_TOKEN
        };
        var SUBSTRING_MATCH_TOKEN = { type: TokenType.SUBSTRING_MATCH_TOKEN };
        var BAD_URL_TOKEN = { type: TokenType.BAD_URL_TOKEN };
        var BAD_STRING_TOKEN = { type: TokenType.BAD_STRING_TOKEN };
        var CDO_TOKEN = { type: TokenType.CDO_TOKEN };
        var CDC_TOKEN = { type: TokenType.CDC_TOKEN };
        var COLON_TOKEN = { type: TokenType.COLON_TOKEN };
        var SEMICOLON_TOKEN = { type: TokenType.SEMICOLON_TOKEN };
        var LEFT_SQUARE_BRACKET_TOKEN = {
            type: TokenType.LEFT_SQUARE_BRACKET_TOKEN
        };
        var RIGHT_SQUARE_BRACKET_TOKEN = {
            type: TokenType.RIGHT_SQUARE_BRACKET_TOKEN
        };
        var WHITESPACE_TOKEN = { type: TokenType.WHITESPACE_TOKEN };
        var EOF_TOKEN = { type: TokenType.EOF_TOKEN };
        var Tokenizer = /** @class */ (function () {
            function Tokenizer() {
                this._value = [];
            }
            Tokenizer.prototype.write = function (chunk) {
                this._value = this._value.concat(toCodePoints(chunk));
            };
            Tokenizer.prototype.read = function () {
                var tokens = [];
                var token = this.consumeToken();
                while (token !== EOF_TOKEN) {
                    tokens.push(token);
                    token = this.consumeToken();
                }
                return tokens;
            };
            Tokenizer.prototype.consumeToken = function () {
                var codePoint = this.consumeCodePoint();
                switch (codePoint) {
                    case QUOTATION_MARK:
                        return this.consumeStringToken(QUOTATION_MARK);
                    case NUMBER_SIGN:
                        var c1 = this.peekCodePoint(0);
                        var c2 = this.peekCodePoint(1);
                        var c3 = this.peekCodePoint(2);
                        if (isNameCodePoint(c1) || isValidEscape(c2, c3)) {
                            var flags = isIdentifierStart(c1, c2, c3) ? FLAG_ID : FLAG_UNRESTRICTED;
                            var value = this.consumeName();
                            return { type: TokenType.HASH_TOKEN, value: value, flags: flags };
                        }
                        break;
                    case DOLLAR_SIGN:
                        if (this.peekCodePoint(0) === EQUALS_SIGN) {
                            this.consumeCodePoint();
                            return SUFFIX_MATCH_TOKEN;
                        }
                        break;
                    case APOSTROPHE:
                        return this.consumeStringToken(APOSTROPHE);
                    case LEFT_PARENTHESIS:
                        return LEFT_PARENTHESIS_TOKEN;
                    case RIGHT_PARENTHESIS:
                        return RIGHT_PARENTHESIS_TOKEN;
                    case ASTERISK:
                        if (this.peekCodePoint(0) === EQUALS_SIGN) {
                            this.consumeCodePoint();
                            return SUBSTRING_MATCH_TOKEN;
                        }
                        break;
                    case PLUS_SIGN:
                        if (isNumberStart(codePoint, this.peekCodePoint(0), this.peekCodePoint(1))) {
                            this.reconsumeCodePoint(codePoint);
                            return this.consumeNumericToken();
                        }
                        break;
                    case COMMA:
                        return COMMA_TOKEN;
                    case HYPHEN_MINUS:
                        var e1 = codePoint;
                        var e2 = this.peekCodePoint(0);
                        var e3 = this.peekCodePoint(1);
                        if (isNumberStart(e1, e2, e3)) {
                            this.reconsumeCodePoint(codePoint);
                            return this.consumeNumericToken();
                        }
                        if (isIdentifierStart(e1, e2, e3)) {
                            this.reconsumeCodePoint(codePoint);
                            return this.consumeIdentLikeToken();
                        }
                        if (e2 === HYPHEN_MINUS && e3 === GREATER_THAN_SIGN) {
                            this.consumeCodePoint();
                            this.consumeCodePoint();
                            return CDC_TOKEN;
                        }
                        break;
                    case FULL_STOP:
                        if (isNumberStart(codePoint, this.peekCodePoint(0), this.peekCodePoint(1))) {
                            this.reconsumeCodePoint(codePoint);
                            return this.consumeNumericToken();
                        }
                        break;
                    case SOLIDUS:
                        if (this.peekCodePoint(0) === ASTERISK) {
                            this.consumeCodePoint();
                            while (true) {
                                var c = this.consumeCodePoint();
                                if (c === ASTERISK) {
                                    c = this.consumeCodePoint();
                                    if (c === SOLIDUS) {
                                        return this.consumeToken();
                                    }
                                }
                                if (c === EOF) {
                                    return this.consumeToken();
                                }
                            }
                        }
                        break;
                    case COLON:
                        return COLON_TOKEN;
                    case SEMICOLON:
                        return SEMICOLON_TOKEN;
                    case LESS_THAN_SIGN:
                        if (this.peekCodePoint(0) === EXCLAMATION_MARK &&
                            this.peekCodePoint(1) === HYPHEN_MINUS &&
                            this.peekCodePoint(2) === HYPHEN_MINUS) {
                            this.consumeCodePoint();
                            this.consumeCodePoint();
                            return CDO_TOKEN;
                        }
                        break;
                    case COMMERCIAL_AT:
                        var a1 = this.peekCodePoint(0);
                        var a2 = this.peekCodePoint(1);
                        var a3 = this.peekCodePoint(2);
                        if (isIdentifierStart(a1, a2, a3)) {
                            var value = this.consumeName();
                            return { type: TokenType.AT_KEYWORD_TOKEN, value: value };
                        }
                        break;
                    case LEFT_SQUARE_BRACKET:
                        return LEFT_SQUARE_BRACKET_TOKEN;
                    case REVERSE_SOLIDUS:
                        if (isValidEscape(codePoint, this.peekCodePoint(0))) {
                            this.reconsumeCodePoint(codePoint);
                            return this.consumeIdentLikeToken();
                        }
                        break;
                    case RIGHT_SQUARE_BRACKET:
                        return RIGHT_SQUARE_BRACKET_TOKEN;
                    case CIRCUMFLEX_ACCENT:
                        if (this.peekCodePoint(0) === EQUALS_SIGN) {
                            this.consumeCodePoint();
                            return PREFIX_MATCH_TOKEN;
                        }
                        break;
                    case LEFT_CURLY_BRACKET:
                        return LEFT_CURLY_BRACKET_TOKEN;
                    case RIGHT_CURLY_BRACKET:
                        return RIGHT_CURLY_BRACKET_TOKEN;
                    case u:
                    case U:
                        var u1 = this.peekCodePoint(0);
                        var u2 = this.peekCodePoint(1);
                        if (u1 === PLUS_SIGN && (isHex(u2) || u2 === QUESTION_MARK)) {
                            this.consumeCodePoint();
                            this.consumeUnicodeRangeToken();
                        }
                        this.reconsumeCodePoint(codePoint);
                        return this.consumeIdentLikeToken();
                    case VERTICAL_LINE:
                        if (this.peekCodePoint(0) === EQUALS_SIGN) {
                            this.consumeCodePoint();
                            return DASH_MATCH_TOKEN;
                        }
                        if (this.peekCodePoint(0) === VERTICAL_LINE) {
                            this.consumeCodePoint();
                            return COLUMN_TOKEN;
                        }
                        break;
                    case TILDE:
                        if (this.peekCodePoint(0) === EQUALS_SIGN) {
                            this.consumeCodePoint();
                            return INCLUDE_MATCH_TOKEN;
                        }
                        break;
                    case EOF:
                        return EOF_TOKEN;
                }
                if (isWhiteSpace(codePoint)) {
                    this.consumeWhiteSpace();
                    return WHITESPACE_TOKEN;
                }
                if (isDigit(codePoint)) {
                    this.reconsumeCodePoint(codePoint);
                    return this.consumeNumericToken();
                }
                if (isNameStartCodePoint(codePoint)) {
                    this.reconsumeCodePoint(codePoint);
                    return this.consumeIdentLikeToken();
                }
                return { type: TokenType.DELIM_TOKEN, value: fromCodePoint(codePoint) };
            };
            Tokenizer.prototype.consumeCodePoint = function () {
                var value = this._value.shift();
                return typeof value === 'undefined' ? -1 : value;
            };
            Tokenizer.prototype.reconsumeCodePoint = function (codePoint) {
                this._value.unshift(codePoint);
            };
            Tokenizer.prototype.peekCodePoint = function (delta) {
                if (delta >= this._value.length) {
                    return -1;
                }
                return this._value[delta];
            };
            Tokenizer.prototype.consumeUnicodeRangeToken = function () {
                var digits = [];
                var codePoint = this.consumeCodePoint();
                while (isHex(codePoint) && digits.length < 6) {
                    digits.push(codePoint);
                    codePoint = this.consumeCodePoint();
                }
                var questionMarks = false;
                while (codePoint === QUESTION_MARK && digits.length < 6) {
                    digits.push(codePoint);
                    codePoint = this.consumeCodePoint();
                    questionMarks = true;
                }
                if (questionMarks) {
                    var start_1 = parseInt(fromCodePoint.apply(void 0, digits.map(function (digit) { return (digit === QUESTION_MARK ? ZERO : digit); })), 16);
                    var end = parseInt(fromCodePoint.apply(void 0, digits.map(function (digit) { return (digit === QUESTION_MARK ? F : digit); })), 16);
                    return { type: TokenType.UNICODE_RANGE_TOKEN, start: start_1, end: end };
                }
                var start = parseInt(fromCodePoint.apply(void 0, digits), 16);
                if (this.peekCodePoint(0) === HYPHEN_MINUS && isHex(this.peekCodePoint(1))) {
                    this.consumeCodePoint();
                    codePoint = this.consumeCodePoint();
                    var endDigits = [];
                    while (isHex(codePoint) && endDigits.length < 6) {
                        endDigits.push(codePoint);
                        codePoint = this.consumeCodePoint();
                    }
                    var end = parseInt(fromCodePoint.apply(void 0, endDigits), 16);
                    return { type: TokenType.UNICODE_RANGE_TOKEN, start: start, end: end };
                }
                else {
                    return { type: TokenType.UNICODE_RANGE_TOKEN, start: start, end: start };
                }
            };
            Tokenizer.prototype.consumeIdentLikeToken = function () {
                var value = this.consumeName();
                if (value.toLowerCase() === 'url' && this.peekCodePoint(0) === LEFT_PARENTHESIS) {
                    this.consumeCodePoint();
                    return this.consumeUrlToken();
                }
                else if (this.peekCodePoint(0) === LEFT_PARENTHESIS) {
                    this.consumeCodePoint();
                    return { type: TokenType.FUNCTION_TOKEN, value: value };
                }
                return { type: TokenType.IDENT_TOKEN, value: value };
            };
            Tokenizer.prototype.consumeUrlToken = function () {
                var value = [];
                this.consumeWhiteSpace();
                if (this.peekCodePoint(0) === EOF) {
                    return { type: TokenType.URL_TOKEN, value: '' };
                }
                var next = this.peekCodePoint(0);
                if (next === APOSTROPHE || next === QUOTATION_MARK) {
                    var stringToken = this.consumeStringToken(this.consumeCodePoint());
                    if (stringToken.type === TokenType.STRING_TOKEN) {
                        this.consumeWhiteSpace();
                        if (this.peekCodePoint(0) === EOF || this.peekCodePoint(0) === RIGHT_PARENTHESIS) {
                            this.consumeCodePoint();
                            return { type: TokenType.URL_TOKEN, value: stringToken.value };
                        }
                    }
                    this.consumeBadUrlRemnants();
                    return BAD_URL_TOKEN;
                }
                while (true) {
                    var codePoint = this.consumeCodePoint();
                    if (codePoint === EOF || codePoint === RIGHT_PARENTHESIS) {
                        return { type: TokenType.URL_TOKEN, value: fromCodePoint.apply(void 0, value) };
                    }
                    else if (isWhiteSpace(codePoint)) {
                        this.consumeWhiteSpace();
                        if (this.peekCodePoint(0) === EOF || this.peekCodePoint(0) === RIGHT_PARENTHESIS) {
                            this.consumeCodePoint();
                            return { type: TokenType.URL_TOKEN, value: fromCodePoint.apply(void 0, value) };
                        }
                        this.consumeBadUrlRemnants();
                        return BAD_URL_TOKEN;
                    }
                    else if (codePoint === QUOTATION_MARK ||
                        codePoint === APOSTROPHE ||
                        codePoint === LEFT_PARENTHESIS ||
                        isNonPrintableCodePoint(codePoint)) {
                        this.consumeBadUrlRemnants();
                        return BAD_URL_TOKEN;
                    }
                    else if (codePoint === REVERSE_SOLIDUS) {
                        if (isValidEscape(codePoint, this.peekCodePoint(0))) {
                            value.push(this.consumeEscapedCodePoint());
                        }
                        else {
                            this.consumeBadUrlRemnants();
                            return BAD_URL_TOKEN;
                        }
                    }
                    else {
                        value.push(codePoint);
                    }
                }
            };
            Tokenizer.prototype.consumeWhiteSpace = function () {
                while (isWhiteSpace(this.peekCodePoint(0))) {
                    this.consumeCodePoint();
                }
            };
            Tokenizer.prototype.consumeBadUrlRemnants = function () {
                while (true) {
                    var codePoint = this.consumeCodePoint();
                    if (codePoint === RIGHT_PARENTHESIS || codePoint === EOF) {
                        return;
                    }
                    if (isValidEscape(codePoint, this.peekCodePoint(0))) {
                        this.consumeEscapedCodePoint();
                    }
                }
            };
            Tokenizer.prototype.consumeStringSlice = function (count) {
                var SLICE_STACK_SIZE = 60000;
                var value = '';
                while (count > 0) {
                    var amount = Math.min(SLICE_STACK_SIZE, count);
                    value += fromCodePoint.apply(void 0, this._value.splice(0, amount));
                    count -= amount;
                }
                this._value.shift();
                return value;
            };
            Tokenizer.prototype.consumeStringToken = function (endingCodePoint) {
                var value = '';
                var i = 0;
                do {
                    var codePoint = this._value[i];
                    if (codePoint === EOF || codePoint === undefined || codePoint === endingCodePoint) {
                        value += this.consumeStringSlice(i);
                        return { type: TokenType.STRING_TOKEN, value: value };
                    }
                    if (codePoint === LINE_FEED) {
                        this._value.splice(0, i);
                        return BAD_STRING_TOKEN;
                    }
                    if (codePoint === REVERSE_SOLIDUS) {
                        var next = this._value[i + 1];
                        if (next !== EOF && next !== undefined) {
                            if (next === LINE_FEED) {
                                value += this.consumeStringSlice(i);
                                i = -1;
                                this._value.shift();
                            }
                            else if (isValidEscape(codePoint, next)) {
                                value += this.consumeStringSlice(i);
                                value += fromCodePoint(this.consumeEscapedCodePoint());
                                i = -1;
                            }
                        }
                    }
                    i++;
                } while (true);
            };
            Tokenizer.prototype.consumeNumber = function () {
                var repr = [];
                var type = FLAG_INTEGER;
                var c1 = this.peekCodePoint(0);
                if (c1 === PLUS_SIGN || c1 === HYPHEN_MINUS) {
                    repr.push(this.consumeCodePoint());
                }
                while (isDigit(this.peekCodePoint(0))) {
                    repr.push(this.consumeCodePoint());
                }
                c1 = this.peekCodePoint(0);
                var c2 = this.peekCodePoint(1);
                if (c1 === FULL_STOP && isDigit(c2)) {
                    repr.push(this.consumeCodePoint(), this.consumeCodePoint());
                    type = FLAG_NUMBER;
                    while (isDigit(this.peekCodePoint(0))) {
                        repr.push(this.consumeCodePoint());
                    }
                }
                c1 = this.peekCodePoint(0);
                c2 = this.peekCodePoint(1);
                var c3 = this.peekCodePoint(2);
                if ((c1 === E || c1 === e) && (((c2 === PLUS_SIGN || c2 === HYPHEN_MINUS) && isDigit(c3)) || isDigit(c2))) {
                    repr.push(this.consumeCodePoint(), this.consumeCodePoint());
                    type = FLAG_NUMBER;
                    while (isDigit(this.peekCodePoint(0))) {
                        repr.push(this.consumeCodePoint());
                    }
                }
                return [stringToNumber(repr), type];
            };
            Tokenizer.prototype.consumeNumericToken = function () {
                var _a = this.consumeNumber(), number = _a[0], flags = _a[1];
                var c1 = this.peekCodePoint(0);
                var c2 = this.peekCodePoint(1);
                var c3 = this.peekCodePoint(2);
                if (isIdentifierStart(c1, c2, c3)) {
                    var unit = this.consumeName();
                    return { type: TokenType.DIMENSION_TOKEN, number: number, flags: flags, unit: unit };
                }
                if (c1 === PERCENTAGE_SIGN) {
                    this.consumeCodePoint();
                    return { type: TokenType.PERCENTAGE_TOKEN, number: number, flags: flags };
                }
                return { type: TokenType.NUMBER_TOKEN, number: number, flags: flags };
            };
            Tokenizer.prototype.consumeEscapedCodePoint = function () {
                var codePoint = this.consumeCodePoint();
                if (isHex(codePoint)) {
                    var hex = fromCodePoint(codePoint);
                    while (isHex(this.peekCodePoint(0)) && hex.length < 6) {
                        hex += fromCodePoint(this.consumeCodePoint());
                    }
                    if (isWhiteSpace(this.peekCodePoint(0))) {
                        this.consumeCodePoint();
                    }
                    var hexCodePoint = parseInt(hex, 16);
                    if (hexCodePoint === 0 || isSurrogateCodePoint(hexCodePoint) || hexCodePoint > 0x10ffff) {
                        return REPLACEMENT_CHARACTER;
                    }
                    return hexCodePoint;
                }
                if (codePoint === EOF) {
                    return REPLACEMENT_CHARACTER;
                }
                return codePoint;
            };
            Tokenizer.prototype.consumeName = function () {
                var result = '';
                while (true) {
                    var codePoint = this.consumeCodePoint();
                    if (isNameCodePoint(codePoint)) {
                        result += fromCodePoint(codePoint);
                    }
                    else if (isValidEscape(codePoint, this.peekCodePoint(0))) {
                        result += fromCodePoint(this.consumeEscapedCodePoint());
                    }
                    else {
                        this.reconsumeCodePoint(codePoint);
                        return result;
                    }
                }
            };
            return Tokenizer;
        }());

        var Parser = /** @class */ (function () {
            function Parser(tokens) {
                this._tokens = tokens;
            }
            Parser.create = function (value) {
                var tokenizer = new Tokenizer();
                tokenizer.write(value);
                return new Parser(tokenizer.read());
            };
            Parser.parseValue = function (value) {
                return Parser.create(value).parseComponentValue();
            };
            Parser.parseValues = function (value) {
                return Parser.create(value).parseComponentValues();
            };
            Parser.prototype.parseComponentValue = function () {
                var token = this.consumeToken();
                while (token.type === TokenType.WHITESPACE_TOKEN) {
                    token = this.consumeToken();
                }
                if (token.type === TokenType.EOF_TOKEN) {
                    throw new SyntaxError("Error parsing CSS component value, unexpected EOF");
                }
                this.reconsumeToken(token);
                var value = this.consumeComponentValue();
                do {
                    token = this.consumeToken();
                } while (token.type === TokenType.WHITESPACE_TOKEN);
                if (token.type === TokenType.EOF_TOKEN) {
                    return value;
                }
                throw new SyntaxError("Error parsing CSS component value, multiple values found when expecting only one");
            };
            Parser.prototype.parseComponentValues = function () {
                var values = [];
                while (true) {
                    var value = this.consumeComponentValue();
                    if (value.type === TokenType.EOF_TOKEN) {
                        return values;
                    }
                    values.push(value);
                    values.push();
                }
            };
            Parser.prototype.consumeComponentValue = function () {
                var token = this.consumeToken();
                switch (token.type) {
                    case TokenType.LEFT_CURLY_BRACKET_TOKEN:
                    case TokenType.LEFT_SQUARE_BRACKET_TOKEN:
                    case TokenType.LEFT_PARENTHESIS_TOKEN:
                        return this.consumeSimpleBlock(token.type);
                    case TokenType.FUNCTION_TOKEN:
                        return this.consumeFunction(token);
                }
                return token;
            };
            Parser.prototype.consumeSimpleBlock = function (type) {
                var block = { type: type, values: [] };
                var token = this.consumeToken();
                while (true) {
                    if (token.type === TokenType.EOF_TOKEN || isEndingTokenFor(token, type)) {
                        return block;
                    }
                    this.reconsumeToken(token);
                    block.values.push(this.consumeComponentValue());
                    token = this.consumeToken();
                }
            };
            Parser.prototype.consumeFunction = function (functionToken) {
                var cssFunction = {
                    name: functionToken.value,
                    values: [],
                    type: TokenType.FUNCTION
                };
                while (true) {
                    var token = this.consumeToken();
                    if (token.type === TokenType.EOF_TOKEN || token.type === TokenType.RIGHT_PARENTHESIS_TOKEN) {
                        return cssFunction;
                    }
                    this.reconsumeToken(token);
                    cssFunction.values.push(this.consumeComponentValue());
                }
            };
            Parser.prototype.consumeToken = function () {
                var token = this._tokens.shift();
                return typeof token === 'undefined' ? EOF_TOKEN : token;
            };
            Parser.prototype.reconsumeToken = function (token) {
                this._tokens.unshift(token);
            };
            return Parser;
        }());
        var isDimensionToken = function (token) { return token.type === TokenType.DIMENSION_TOKEN; };
        var isNumberToken = function (token) { return token.type === TokenType.NUMBER_TOKEN; };
        var isIdentToken = function (token) { return token.type === TokenType.IDENT_TOKEN; };
        var isStringToken = function (token) { return token.type === TokenType.STRING_TOKEN; };
        var isIdentWithValue = function (token, value) {
            return isIdentToken(token) && token.value === value;
        };
        var nonWhiteSpace = function (token) { return token.type !== TokenType.WHITESPACE_TOKEN; };
        var nonFunctionArgSeparator = function (token) {
            return token.type !== TokenType.WHITESPACE_TOKEN && token.type !== TokenType.COMMA_TOKEN;
        };
        var parseFunctionArgs = function (tokens) {
            var args = [];
            var arg = [];
            tokens.forEach(function (token) {
                if (token.type === TokenType.COMMA_TOKEN) {
                    if (arg.length === 0) {
                        throw new Error("Error parsing function args, zero tokens for arg");
                    }
                    args.push(arg);
                    arg = [];
                    return;
                }
                if (token.type !== TokenType.WHITESPACE_TOKEN) {
                    arg.push(token);
                }
            });
            if (arg.length) {
                args.push(arg);
            }
            return args;
        };
        var isEndingTokenFor = function (token, type) {
            if (type === TokenType.LEFT_CURLY_BRACKET_TOKEN && token.type === TokenType.RIGHT_CURLY_BRACKET_TOKEN) {
                return true;
            }
            if (type === TokenType.LEFT_SQUARE_BRACKET_TOKEN && token.type === TokenType.RIGHT_SQUARE_BRACKET_TOKEN) {
                return true;
            }
            return type === TokenType.LEFT_PARENTHESIS_TOKEN && token.type === TokenType.RIGHT_PARENTHESIS_TOKEN;
        };

        var isLength = function (token) {
            return token.type === TokenType.NUMBER_TOKEN || token.type === TokenType.DIMENSION_TOKEN;
        };

        var isLengthPercentage = function (token) {
            return token.type === TokenType.PERCENTAGE_TOKEN || isLength(token);
        };
        var parseLengthPercentageTuple = function (tokens) {
            return tokens.length > 1 ? [tokens[0], tokens[1]] : [tokens[0]];
        };
        var ZERO_LENGTH = {
            type: TokenType.NUMBER_TOKEN,
            number: 0,
            flags: FLAG_INTEGER
        };
        var FIFTY_PERCENT = {
            type: TokenType.PERCENTAGE_TOKEN,
            number: 50,
            flags: FLAG_INTEGER
        };
        var HUNDRED_PERCENT = {
            type: TokenType.PERCENTAGE_TOKEN,
            number: 100,
            flags: FLAG_INTEGER
        };
        var getAbsoluteValueForTuple = function (tuple, width, height) {
            var x = tuple[0], y = tuple[1];
            return [getAbsoluteValue(x, width), getAbsoluteValue(typeof y !== 'undefined' ? y : x, height)];
        };
        var getAbsoluteValue = function (token, parent) {
            if (token.type === TokenType.PERCENTAGE_TOKEN) {
                return (token.number / 100) * parent;
            }
            if (isDimensionToken(token)) {
                switch (token.unit) {
                    case 'rem':
                    case 'em':
                        return 16 * token.number; // TODO use correct font-size
                    case 'px':
                    default:
                        return token.number;
                }
            }
            return token.number;
        };

        var DEG = 'deg';
        var GRAD = 'grad';
        var RAD = 'rad';
        var TURN = 'turn';
        var angle = {
            name: 'angle',
            parse: function (value) {
                if (value.type === TokenType.DIMENSION_TOKEN) {
                    switch (value.unit) {
                        case DEG:
                            return (Math.PI * value.number) / 180;
                        case GRAD:
                            return (Math.PI / 200) * value.number;
                        case RAD:
                            return value.number;
                        case TURN:
                            return Math.PI * 2 * value.number;
                    }
                }
                throw new Error("Unsupported angle type");
            }
        };
        var isAngle = function (value) {
            if (value.type === TokenType.DIMENSION_TOKEN) {
                if (value.unit === DEG || value.unit === GRAD || value.unit === RAD || value.unit === TURN) {
                    return true;
                }
            }
            return false;
        };
        var parseNamedSide = function (tokens) {
            var sideOrCorner = tokens
                .filter(isIdentToken)
                .map(function (ident) { return ident.value; })
                .join(' ');
            switch (sideOrCorner) {
                case 'to bottom right':
                case 'to right bottom':
                case 'left top':
                case 'top left':
                    return [ZERO_LENGTH, ZERO_LENGTH];
                case 'to top':
                case 'bottom':
                    return deg(0);
                case 'to bottom left':
                case 'to left bottom':
                case 'right top':
                case 'top right':
                    return [ZERO_LENGTH, HUNDRED_PERCENT];
                case 'to right':
                case 'left':
                    return deg(90);
                case 'to top left':
                case 'to left top':
                case 'right bottom':
                case 'bottom right':
                    return [HUNDRED_PERCENT, HUNDRED_PERCENT];
                case 'to bottom':
                case 'top':
                    return deg(180);
                case 'to top right':
                case 'to right top':
                case 'left bottom':
                case 'bottom left':
                    return [HUNDRED_PERCENT, ZERO_LENGTH];
                case 'to left':
                case 'right':
                    return deg(270);
            }
            return 0;
        };
        var deg = function (deg) { return (Math.PI * deg) / 180; };

        var color = {
            name: 'color',
            parse: function (value) {
                if (value.type === TokenType.FUNCTION) {
                    var colorFunction = SUPPORTED_COLOR_FUNCTIONS[value.name];
                    if (typeof colorFunction === 'undefined') {
                        throw new Error("Attempting to parse an unsupported color function \"" + value.name + "\"");
                    }
                    return colorFunction(value.values);
                }
                if (value.type === TokenType.HASH_TOKEN) {
                    if (value.value.length === 3) {
                        var r = value.value.substring(0, 1);
                        var g = value.value.substring(1, 2);
                        var b = value.value.substring(2, 3);
                        return pack(parseInt(r + r, 16), parseInt(g + g, 16), parseInt(b + b, 16), 1);
                    }
                    if (value.value.length === 4) {
                        var r = value.value.substring(0, 1);
                        var g = value.value.substring(1, 2);
                        var b = value.value.substring(2, 3);
                        var a = value.value.substring(3, 4);
                        return pack(parseInt(r + r, 16), parseInt(g + g, 16), parseInt(b + b, 16), parseInt(a + a, 16) / 255);
                    }
                    if (value.value.length === 6) {
                        var r = value.value.substring(0, 2);
                        var g = value.value.substring(2, 4);
                        var b = value.value.substring(4, 6);
                        return pack(parseInt(r, 16), parseInt(g, 16), parseInt(b, 16), 1);
                    }
                    if (value.value.length === 8) {
                        var r = value.value.substring(0, 2);
                        var g = value.value.substring(2, 4);
                        var b = value.value.substring(4, 6);
                        var a = value.value.substring(6, 8);
                        return pack(parseInt(r, 16), parseInt(g, 16), parseInt(b, 16), parseInt(a, 16) / 255);
                    }
                }
                if (value.type === TokenType.IDENT_TOKEN) {
                    var namedColor = COLORS[value.value.toUpperCase()];
                    if (typeof namedColor !== 'undefined') {
                        return namedColor;
                    }
                }
                return COLORS.TRANSPARENT;
            }
        };
        var isTransparent = function (color) { return (0xff & color) === 0; };
        var asString = function (color) {
            var alpha = 0xff & color;
            var blue = 0xff & (color >> 8);
            var green = 0xff & (color >> 16);
            var red = 0xff & (color >> 24);
            return alpha < 255 ? "rgba(" + red + "," + green + "," + blue + "," + alpha / 255 + ")" : "rgb(" + red + "," + green + "," + blue + ")";
        };
        var pack = function (r, g, b, a) {
            return ((r << 24) | (g << 16) | (b << 8) | (Math.round(a * 255) << 0)) >>> 0;
        };
        var getTokenColorValue = function (token, i) {
            if (token.type === TokenType.NUMBER_TOKEN) {
                return token.number;
            }
            if (token.type === TokenType.PERCENTAGE_TOKEN) {
                var max = i === 3 ? 1 : 255;
                return i === 3 ? (token.number / 100) * max : Math.round((token.number / 100) * max);
            }
            return 0;
        };
        var rgb = function (args) {
            var tokens = args.filter(nonFunctionArgSeparator);
            if (tokens.length === 3) {
                var _a = tokens.map(getTokenColorValue), r = _a[0], g = _a[1], b = _a[2];
                return pack(r, g, b, 1);
            }
            if (tokens.length === 4) {
                var _b = tokens.map(getTokenColorValue), r = _b[0], g = _b[1], b = _b[2], a = _b[3];
                return pack(r, g, b, a);
            }
            return 0;
        };
        function hue2rgb(t1, t2, hue) {
            if (hue < 0) {
                hue += 1;
            }
            if (hue >= 1) {
                hue -= 1;
            }
            if (hue < 1 / 6) {
                return (t2 - t1) * hue * 6 + t1;
            }
            else if (hue < 1 / 2) {
                return t2;
            }
            else if (hue < 2 / 3) {
                return (t2 - t1) * 6 * (2 / 3 - hue) + t1;
            }
            else {
                return t1;
            }
        }
        var hsl = function (args) {
            var tokens = args.filter(nonFunctionArgSeparator);
            var hue = tokens[0], saturation = tokens[1], lightness = tokens[2], alpha = tokens[3];
            var h = (hue.type === TokenType.NUMBER_TOKEN ? deg(hue.number) : angle.parse(hue)) / (Math.PI * 2);
            var s = isLengthPercentage(saturation) ? saturation.number / 100 : 0;
            var l = isLengthPercentage(lightness) ? lightness.number / 100 : 0;
            var a = typeof alpha !== 'undefined' && isLengthPercentage(alpha) ? getAbsoluteValue(alpha, 1) : 1;
            if (s === 0) {
                return pack(l * 255, l * 255, l * 255, 1);
            }
            var t2 = l <= 0.5 ? l * (s + 1) : l + s - l * s;
            var t1 = l * 2 - t2;
            var r = hue2rgb(t1, t2, h + 1 / 3);
            var g = hue2rgb(t1, t2, h);
            var b = hue2rgb(t1, t2, h - 1 / 3);
            return pack(r * 255, g * 255, b * 255, a);
        };
        var SUPPORTED_COLOR_FUNCTIONS = {
            hsl: hsl,
            hsla: hsl,
            rgb: rgb,
            rgba: rgb
        };
        var COLORS = {
            ALICEBLUE: 0xf0f8ffff,
            ANTIQUEWHITE: 0xfaebd7ff,
            AQUA: 0x00ffffff,
            AQUAMARINE: 0x7fffd4ff,
            AZURE: 0xf0ffffff,
            BEIGE: 0xf5f5dcff,
            BISQUE: 0xffe4c4ff,
            BLACK: 0x000000ff,
            BLANCHEDALMOND: 0xffebcdff,
            BLUE: 0x0000ffff,
            BLUEVIOLET: 0x8a2be2ff,
            BROWN: 0xa52a2aff,
            BURLYWOOD: 0xdeb887ff,
            CADETBLUE: 0x5f9ea0ff,
            CHARTREUSE: 0x7fff00ff,
            CHOCOLATE: 0xd2691eff,
            CORAL: 0xff7f50ff,
            CORNFLOWERBLUE: 0x6495edff,
            CORNSILK: 0xfff8dcff,
            CRIMSON: 0xdc143cff,
            CYAN: 0x00ffffff,
            DARKBLUE: 0x00008bff,
            DARKCYAN: 0x008b8bff,
            DARKGOLDENROD: 0xb886bbff,
            DARKGRAY: 0xa9a9a9ff,
            DARKGREEN: 0x006400ff,
            DARKGREY: 0xa9a9a9ff,
            DARKKHAKI: 0xbdb76bff,
            DARKMAGENTA: 0x8b008bff,
            DARKOLIVEGREEN: 0x556b2fff,
            DARKORANGE: 0xff8c00ff,
            DARKORCHID: 0x9932ccff,
            DARKRED: 0x8b0000ff,
            DARKSALMON: 0xe9967aff,
            DARKSEAGREEN: 0x8fbc8fff,
            DARKSLATEBLUE: 0x483d8bff,
            DARKSLATEGRAY: 0x2f4f4fff,
            DARKSLATEGREY: 0x2f4f4fff,
            DARKTURQUOISE: 0x00ced1ff,
            DARKVIOLET: 0x9400d3ff,
            DEEPPINK: 0xff1493ff,
            DEEPSKYBLUE: 0x00bfffff,
            DIMGRAY: 0x696969ff,
            DIMGREY: 0x696969ff,
            DODGERBLUE: 0x1e90ffff,
            FIREBRICK: 0xb22222ff,
            FLORALWHITE: 0xfffaf0ff,
            FORESTGREEN: 0x228b22ff,
            FUCHSIA: 0xff00ffff,
            GAINSBORO: 0xdcdcdcff,
            GHOSTWHITE: 0xf8f8ffff,
            GOLD: 0xffd700ff,
            GOLDENROD: 0xdaa520ff,
            GRAY: 0x808080ff,
            GREEN: 0x008000ff,
            GREENYELLOW: 0xadff2fff,
            GREY: 0x808080ff,
            HONEYDEW: 0xf0fff0ff,
            HOTPINK: 0xff69b4ff,
            INDIANRED: 0xcd5c5cff,
            INDIGO: 0x4b0082ff,
            IVORY: 0xfffff0ff,
            KHAKI: 0xf0e68cff,
            LAVENDER: 0xe6e6faff,
            LAVENDERBLUSH: 0xfff0f5ff,
            LAWNGREEN: 0x7cfc00ff,
            LEMONCHIFFON: 0xfffacdff,
            LIGHTBLUE: 0xadd8e6ff,
            LIGHTCORAL: 0xf08080ff,
            LIGHTCYAN: 0xe0ffffff,
            LIGHTGOLDENRODYELLOW: 0xfafad2ff,
            LIGHTGRAY: 0xd3d3d3ff,
            LIGHTGREEN: 0x90ee90ff,
            LIGHTGREY: 0xd3d3d3ff,
            LIGHTPINK: 0xffb6c1ff,
            LIGHTSALMON: 0xffa07aff,
            LIGHTSEAGREEN: 0x20b2aaff,
            LIGHTSKYBLUE: 0x87cefaff,
            LIGHTSLATEGRAY: 0x778899ff,
            LIGHTSLATEGREY: 0x778899ff,
            LIGHTSTEELBLUE: 0xb0c4deff,
            LIGHTYELLOW: 0xffffe0ff,
            LIME: 0x00ff00ff,
            LIMEGREEN: 0x32cd32ff,
            LINEN: 0xfaf0e6ff,
            MAGENTA: 0xff00ffff,
            MAROON: 0x800000ff,
            MEDIUMAQUAMARINE: 0x66cdaaff,
            MEDIUMBLUE: 0x0000cdff,
            MEDIUMORCHID: 0xba55d3ff,
            MEDIUMPURPLE: 0x9370dbff,
            MEDIUMSEAGREEN: 0x3cb371ff,
            MEDIUMSLATEBLUE: 0x7b68eeff,
            MEDIUMSPRINGGREEN: 0x00fa9aff,
            MEDIUMTURQUOISE: 0x48d1ccff,
            MEDIUMVIOLETRED: 0xc71585ff,
            MIDNIGHTBLUE: 0x191970ff,
            MINTCREAM: 0xf5fffaff,
            MISTYROSE: 0xffe4e1ff,
            MOCCASIN: 0xffe4b5ff,
            NAVAJOWHITE: 0xffdeadff,
            NAVY: 0x000080ff,
            OLDLACE: 0xfdf5e6ff,
            OLIVE: 0x808000ff,
            OLIVEDRAB: 0x6b8e23ff,
            ORANGE: 0xffa500ff,
            ORANGERED: 0xff4500ff,
            ORCHID: 0xda70d6ff,
            PALEGOLDENROD: 0xeee8aaff,
            PALEGREEN: 0x98fb98ff,
            PALETURQUOISE: 0xafeeeeff,
            PALEVIOLETRED: 0xdb7093ff,
            PAPAYAWHIP: 0xffefd5ff,
            PEACHPUFF: 0xffdab9ff,
            PERU: 0xcd853fff,
            PINK: 0xffc0cbff,
            PLUM: 0xdda0ddff,
            POWDERBLUE: 0xb0e0e6ff,
            PURPLE: 0x800080ff,
            REBECCAPURPLE: 0x663399ff,
            RED: 0xff0000ff,
            ROSYBROWN: 0xbc8f8fff,
            ROYALBLUE: 0x4169e1ff,
            SADDLEBROWN: 0x8b4513ff,
            SALMON: 0xfa8072ff,
            SANDYBROWN: 0xf4a460ff,
            SEAGREEN: 0x2e8b57ff,
            SEASHELL: 0xfff5eeff,
            SIENNA: 0xa0522dff,
            SILVER: 0xc0c0c0ff,
            SKYBLUE: 0x87ceebff,
            SLATEBLUE: 0x6a5acdff,
            SLATEGRAY: 0x708090ff,
            SLATEGREY: 0x708090ff,
            SNOW: 0xfffafaff,
            SPRINGGREEN: 0x00ff7fff,
            STEELBLUE: 0x4682b4ff,
            TAN: 0xd2b48cff,
            TEAL: 0x008080ff,
            THISTLE: 0xd8bfd8ff,
            TOMATO: 0xff6347ff,
            TRANSPARENT: 0x00000000,
            TURQUOISE: 0x40e0d0ff,
            VIOLET: 0xee82eeff,
            WHEAT: 0xf5deb3ff,
            WHITE: 0xffffffff,
            WHITESMOKE: 0xf5f5f5ff,
            YELLOW: 0xffff00ff,
            YELLOWGREEN: 0x9acd32ff
        };

        var PropertyDescriptorParsingType;
        (function (PropertyDescriptorParsingType) {
            PropertyDescriptorParsingType[PropertyDescriptorParsingType["VALUE"] = 0] = "VALUE";
            PropertyDescriptorParsingType[PropertyDescriptorParsingType["LIST"] = 1] = "LIST";
            PropertyDescriptorParsingType[PropertyDescriptorParsingType["IDENT_VALUE"] = 2] = "IDENT_VALUE";
            PropertyDescriptorParsingType[PropertyDescriptorParsingType["TYPE_VALUE"] = 3] = "TYPE_VALUE";
            PropertyDescriptorParsingType[PropertyDescriptorParsingType["TOKEN_VALUE"] = 4] = "TOKEN_VALUE";
        })(PropertyDescriptorParsingType || (PropertyDescriptorParsingType = {}));

        var BACKGROUND_CLIP;
        (function (BACKGROUND_CLIP) {
            BACKGROUND_CLIP[BACKGROUND_CLIP["BORDER_BOX"] = 0] = "BORDER_BOX";
            BACKGROUND_CLIP[BACKGROUND_CLIP["PADDING_BOX"] = 1] = "PADDING_BOX";
            BACKGROUND_CLIP[BACKGROUND_CLIP["CONTENT_BOX"] = 2] = "CONTENT_BOX";
        })(BACKGROUND_CLIP || (BACKGROUND_CLIP = {}));
        var backgroundClip = {
            name: 'background-clip',
            initialValue: 'border-box',
            prefix: false,
            type: PropertyDescriptorParsingType.LIST,
            parse: function (tokens) {
                return tokens.map(function (token) {
                    if (isIdentToken(token)) {
                        switch (token.value) {
                            case 'padding-box':
                                return BACKGROUND_CLIP.PADDING_BOX;
                            case 'content-box':
                                return BACKGROUND_CLIP.CONTENT_BOX;
                        }
                    }
                    return BACKGROUND_CLIP.BORDER_BOX;
                });
            }
        };

        var backgroundColor = {
            name: "background-color",
            initialValue: 'transparent',
            prefix: false,
            type: PropertyDescriptorParsingType.TYPE_VALUE,
            format: 'color'
        };

        var parseColorStop = function (args) {
            var color$1 = color.parse(args[0]);
            var stop = args[1];
            return stop && isLengthPercentage(stop) ? { color: color$1, stop: stop } : { color: color$1, stop: null };
        };
        var processColorStops = function (stops, lineLength) {
            var first = stops[0];
            var last = stops[stops.length - 1];
            if (first.stop === null) {
                first.stop = ZERO_LENGTH;
            }
            if (last.stop === null) {
                last.stop = HUNDRED_PERCENT;
            }
            var processStops = [];
            var previous = 0;
            for (var i = 0; i < stops.length; i++) {
                var stop_1 = stops[i].stop;
                if (stop_1 !== null) {
                    var absoluteValue = getAbsoluteValue(stop_1, lineLength);
                    if (absoluteValue > previous) {
                        processStops.push(absoluteValue);
                    }
                    else {
                        processStops.push(previous);
                    }
                    previous = absoluteValue;
                }
                else {
                    processStops.push(null);
                }
            }
            var gapBegin = null;
            for (var i = 0; i < processStops.length; i++) {
                var stop_2 = processStops[i];
                if (stop_2 === null) {
                    if (gapBegin === null) {
                        gapBegin = i;
                    }
                }
                else if (gapBegin !== null) {
                    var gapLength = i - gapBegin;
                    var beforeGap = processStops[gapBegin - 1];
                    var gapValue = (stop_2 - beforeGap) / (gapLength + 1);
                    for (var g = 1; g <= gapLength; g++) {
                        processStops[gapBegin + g - 1] = gapValue * g;
                    }
                    gapBegin = null;
                }
            }
            return stops.map(function (_a, i) {
                var color = _a.color;
                return { color: color, stop: Math.max(Math.min(1, processStops[i] / lineLength), 0) };
            });
        };
        var getAngleFromCorner = function (corner, width, height) {
            var centerX = width / 2;
            var centerY = height / 2;
            var x = getAbsoluteValue(corner[0], width) - centerX;
            var y = centerY - getAbsoluteValue(corner[1], height);
            return (Math.atan2(y, x) + Math.PI * 2) % (Math.PI * 2);
        };
        var calculateGradientDirection = function (angle, width, height) {
            var radian = typeof angle === 'number' ? angle : getAngleFromCorner(angle, width, height);
            var lineLength = Math.abs(width * Math.sin(radian)) + Math.abs(height * Math.cos(radian));
            var halfWidth = width / 2;
            var halfHeight = height / 2;
            var halfLineLength = lineLength / 2;
            var yDiff = Math.sin(radian - Math.PI / 2) * halfLineLength;
            var xDiff = Math.cos(radian - Math.PI / 2) * halfLineLength;
            return [lineLength, halfWidth - xDiff, halfWidth + xDiff, halfHeight - yDiff, halfHeight + yDiff];
        };
        var distance = function (a, b) { return Math.sqrt(a * a + b * b); };
        var findCorner = function (width, height, x, y, closest) {
            var corners = [[0, 0], [0, height], [width, 0], [width, height]];
            return corners.reduce(function (stat, corner) {
                var cx = corner[0], cy = corner[1];
                var d = distance(x - cx, y - cy);
                if (closest ? d < stat.optimumDistance : d > stat.optimumDistance) {
                    return {
                        optimumCorner: corner,
                        optimumDistance: d
                    };
                }
                return stat;
            }, {
                optimumDistance: closest ? Infinity : -Infinity,
                optimumCorner: null
            }).optimumCorner;
        };
        var calculateRadius = function (gradient, x, y, width, height) {
            var rx = 0;
            var ry = 0;
            switch (gradient.size) {
                case CSSRadialExtent.CLOSEST_SIDE:
                    // The ending shape is sized so that that it exactly meets the side of the gradient box closest to the gradient’s center.
                    // If the shape is an ellipse, it exactly meets the closest side in each dimension.
                    if (gradient.shape === CSSRadialShape.CIRCLE) {
                        rx = ry = Math.min(Math.abs(x), Math.abs(x - width), Math.abs(y), Math.abs(y - height));
                    }
                    else if (gradient.shape === CSSRadialShape.ELLIPSE) {
                        rx = Math.min(Math.abs(x), Math.abs(x - width));
                        ry = Math.min(Math.abs(y), Math.abs(y - height));
                    }
                    break;
                case CSSRadialExtent.CLOSEST_CORNER:
                    // The ending shape is sized so that that it passes through the corner of the gradient box closest to the gradient’s center.
                    // If the shape is an ellipse, the ending shape is given the same aspect-ratio it would have if closest-side were specified.
                    if (gradient.shape === CSSRadialShape.CIRCLE) {
                        rx = ry = Math.min(distance(x, y), distance(x, y - height), distance(x - width, y), distance(x - width, y - height));
                    }
                    else if (gradient.shape === CSSRadialShape.ELLIPSE) {
                        // Compute the ratio ry/rx (which is to be the same as for "closest-side")
                        var c = Math.min(Math.abs(y), Math.abs(y - height)) / Math.min(Math.abs(x), Math.abs(x - width));
                        var _a = findCorner(width, height, x, y, true), cx = _a[0], cy = _a[1];
                        rx = distance(cx - x, (cy - y) / c);
                        ry = c * rx;
                    }
                    break;
                case CSSRadialExtent.FARTHEST_SIDE:
                    // Same as closest-side, except the ending shape is sized based on the farthest side(s)
                    if (gradient.shape === CSSRadialShape.CIRCLE) {
                        rx = ry = Math.max(Math.abs(x), Math.abs(x - width), Math.abs(y), Math.abs(y - height));
                    }
                    else if (gradient.shape === CSSRadialShape.ELLIPSE) {
                        rx = Math.max(Math.abs(x), Math.abs(x - width));
                        ry = Math.max(Math.abs(y), Math.abs(y - height));
                    }
                    break;
                case CSSRadialExtent.FARTHEST_CORNER:
                    // Same as closest-corner, except the ending shape is sized based on the farthest corner.
                    // If the shape is an ellipse, the ending shape is given the same aspect ratio it would have if farthest-side were specified.
                    if (gradient.shape === CSSRadialShape.CIRCLE) {
                        rx = ry = Math.max(distance(x, y), distance(x, y - height), distance(x - width, y), distance(x - width, y - height));
                    }
                    else if (gradient.shape === CSSRadialShape.ELLIPSE) {
                        // Compute the ratio ry/rx (which is to be the same as for "farthest-side")
                        var c = Math.max(Math.abs(y), Math.abs(y - height)) / Math.max(Math.abs(x), Math.abs(x - width));
                        var _b = findCorner(width, height, x, y, false), cx = _b[0], cy = _b[1];
                        rx = distance(cx - x, (cy - y) / c);
                        ry = c * rx;
                    }
                    break;
            }
            if (Array.isArray(gradient.size)) {
                rx = getAbsoluteValue(gradient.size[0], width);
                ry = gradient.size.length === 2 ? getAbsoluteValue(gradient.size[1], height) : rx;
            }
            return [rx, ry];
        };

        var linearGradient = function (tokens) {
            var angle$1 = deg(180);
            var stops = [];
            parseFunctionArgs(tokens).forEach(function (arg, i) {
                if (i === 0) {
                    var firstToken = arg[0];
                    if (firstToken.type === TokenType.IDENT_TOKEN && firstToken.value === 'to') {
                        angle$1 = parseNamedSide(arg);
                        return;
                    }
                    else if (isAngle(firstToken)) {
                        angle$1 = angle.parse(firstToken);
                        return;
                    }
                }
                var colorStop = parseColorStop(arg);
                stops.push(colorStop);
            });
            return { angle: angle$1, stops: stops, type: CSSImageType.LINEAR_GRADIENT };
        };

        var prefixLinearGradient = function (tokens) {
            var angle$1 = deg(180);
            var stops = [];
            parseFunctionArgs(tokens).forEach(function (arg, i) {
                if (i === 0) {
                    var firstToken = arg[0];
                    if (firstToken.type === TokenType.IDENT_TOKEN &&
                        ['top', 'left', 'right', 'bottom'].indexOf(firstToken.value) !== -1) {
                        angle$1 = parseNamedSide(arg);
                        return;
                    }
                    else if (isAngle(firstToken)) {
                        angle$1 = (angle.parse(firstToken) + deg(270)) % deg(360);
                        return;
                    }
                }
                var colorStop = parseColorStop(arg);
                stops.push(colorStop);
            });
            return {
                angle: angle$1,
                stops: stops,
                type: CSSImageType.LINEAR_GRADIENT
            };
        };

        var testRangeBounds = function (document) {
            var TEST_HEIGHT = 123;
            if (document.createRange) {
                var range = document.createRange();
                if (range.getBoundingClientRect) {
                    var testElement = document.createElement('boundtest');
                    testElement.style.height = TEST_HEIGHT + "px";
                    testElement.style.display = 'block';
                    document.body.appendChild(testElement);
                    range.selectNode(testElement);
                    var rangeBounds = range.getBoundingClientRect();
                    var rangeHeight = Math.round(rangeBounds.height);
                    document.body.removeChild(testElement);
                    if (rangeHeight === TEST_HEIGHT) {
                        return true;
                    }
                }
            }
            return false;
        };
        var testCORS = function () { return typeof new Image().crossOrigin !== 'undefined'; };
        var testResponseType = function () { return typeof new XMLHttpRequest().responseType === 'string'; };
        var testSVG = function (document) {
            var img = new Image();
            var canvas = document.createElement('canvas');
            var ctx = canvas.getContext('2d');
            if (!ctx) {
                return false;
            }
            img.src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg'></svg>";
            try {
                ctx.drawImage(img, 0, 0);
                canvas.toDataURL();
            }
            catch (e) {
                return false;
            }
            return true;
        };
        var isGreenPixel = function (data) {
            return data[0] === 0 && data[1] === 255 && data[2] === 0 && data[3] === 255;
        };
        var testForeignObject = function (document) {
            var canvas = document.createElement('canvas');
            var size = 100;
            canvas.width = size;
            canvas.height = size;
            var ctx = canvas.getContext('2d');
            if (!ctx) {
                return Promise.reject(false);
            }
            ctx.fillStyle = 'rgb(0, 255, 0)';
            ctx.fillRect(0, 0, size, size);
            var img = new Image();
            var greenImageSrc = canvas.toDataURL();
            img.src = greenImageSrc;
            var svg = createForeignObjectSVG(size, size, 0, 0, img);
            ctx.fillStyle = 'red';
            ctx.fillRect(0, 0, size, size);
            return loadSerializedSVG(svg)
                .then(function (img) {
                ctx.drawImage(img, 0, 0);
                var data = ctx.getImageData(0, 0, size, size).data;
                ctx.fillStyle = 'red';
                ctx.fillRect(0, 0, size, size);
                var node = document.createElement('div');
                node.style.backgroundImage = "url(" + greenImageSrc + ")";
                node.style.height = size + "px";
                // Firefox 55 does not render inline <img /> tags
                return isGreenPixel(data)
                    ? loadSerializedSVG(createForeignObjectSVG(size, size, 0, 0, node))
                    : Promise.reject(false);
            })
                .then(function (img) {
                ctx.drawImage(img, 0, 0);
                // Edge does not render background-images
                return isGreenPixel(ctx.getImageData(0, 0, size, size).data);
            })
                .catch(function () { return false; });
        };
        var createForeignObjectSVG = function (width, height, x, y, node) {
            var xmlns = 'http://www.w3.org/2000/svg';
            var svg = document.createElementNS(xmlns, 'svg');
            var foreignObject = document.createElementNS(xmlns, 'foreignObject');
            svg.setAttributeNS(null, 'width', width.toString());
            svg.setAttributeNS(null, 'height', height.toString());
            foreignObject.setAttributeNS(null, 'width', '100%');
            foreignObject.setAttributeNS(null, 'height', '100%');
            foreignObject.setAttributeNS(null, 'x', x.toString());
            foreignObject.setAttributeNS(null, 'y', y.toString());
            foreignObject.setAttributeNS(null, 'externalResourcesRequired', 'true');
            svg.appendChild(foreignObject);
            foreignObject.appendChild(node);
            return svg;
        };
        var loadSerializedSVG = function (svg) {
            return new Promise(function (resolve, reject) {
                var img = new Image();
                img.onload = function () { return resolve(img); };
                img.onerror = reject;
                img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(svg));
            });
        };
        var FEATURES = {
            get SUPPORT_RANGE_BOUNDS() {
                var value = testRangeBounds(document);
                Object.defineProperty(FEATURES, 'SUPPORT_RANGE_BOUNDS', { value: value });
                return value;
            },
            get SUPPORT_SVG_DRAWING() {
                var value = testSVG(document);
                Object.defineProperty(FEATURES, 'SUPPORT_SVG_DRAWING', { value: value });
                return value;
            },
            get SUPPORT_FOREIGNOBJECT_DRAWING() {
                var value = typeof Array.from === 'function' && typeof window.fetch === 'function'
                    ? testForeignObject(document)
                    : Promise.resolve(false);
                Object.defineProperty(FEATURES, 'SUPPORT_FOREIGNOBJECT_DRAWING', { value: value });
                return value;
            },
            get SUPPORT_CORS_IMAGES() {
                var value = testCORS();
                Object.defineProperty(FEATURES, 'SUPPORT_CORS_IMAGES', { value: value });
                return value;
            },
            get SUPPORT_RESPONSE_TYPE() {
                var value = testResponseType();
                Object.defineProperty(FEATURES, 'SUPPORT_RESPONSE_TYPE', { value: value });
                return value;
            },
            get SUPPORT_CORS_XHR() {
                var value = 'withCredentials' in new XMLHttpRequest();
                Object.defineProperty(FEATURES, 'SUPPORT_CORS_XHR', { value: value });
                return value;
            }
        };

        var Logger = /** @class */ (function () {
            function Logger(_a) {
                var id = _a.id, enabled = _a.enabled;
                this.id = id;
                this.enabled = enabled;
                this.start = Date.now();
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            Logger.prototype.debug = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                if (this.enabled) {
                    // eslint-disable-next-line no-console
                    if (typeof window !== 'undefined' && window.console && typeof console.debug === 'function') {
                        // eslint-disable-next-line no-console
                        console.debug.apply(console, [this.id, this.getTime() + "ms"].concat(args));
                    }
                    else {
                        this.info.apply(this, args);
                    }
                }
            };
            Logger.prototype.getTime = function () {
                return Date.now() - this.start;
            };
            Logger.create = function (options) {
                Logger.instances[options.id] = new Logger(options);
            };
            Logger.destroy = function (id) {
                delete Logger.instances[id];
            };
            Logger.getInstance = function (id) {
                var instance = Logger.instances[id];
                if (typeof instance === 'undefined') {
                    throw new Error("No logger instance found with id " + id);
                }
                return instance;
            };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            Logger.prototype.info = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                if (this.enabled) {
                    // eslint-disable-next-line no-console
                    if (typeof window !== 'undefined' && window.console && typeof console.info === 'function') {
                        // eslint-disable-next-line no-console
                        console.info.apply(console, [this.id, this.getTime() + "ms"].concat(args));
                    }
                }
            };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            Logger.prototype.error = function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                if (this.enabled) {
                    // eslint-disable-next-line no-console
                    if (typeof window !== 'undefined' && window.console && typeof console.error === 'function') {
                        // eslint-disable-next-line no-console
                        console.error.apply(console, [this.id, this.getTime() + "ms"].concat(args));
                    }
                    else {
                        this.info.apply(this, args);
                    }
                }
            };
            Logger.instances = {};
            return Logger;
        }());

        var CacheStorage = /** @class */ (function () {
            function CacheStorage() {
            }
            CacheStorage.create = function (name, options) {
                return (CacheStorage._caches[name] = new Cache(name, options));
            };
            CacheStorage.destroy = function (name) {
                delete CacheStorage._caches[name];
            };
            CacheStorage.open = function (name) {
                var cache = CacheStorage._caches[name];
                if (typeof cache !== 'undefined') {
                    return cache;
                }
                throw new Error("Cache with key \"" + name + "\" not found");
            };
            CacheStorage.getOrigin = function (url) {
                var link = CacheStorage._link;
                if (!link) {
                    return 'about:blank';
                }
                link.href = url;
                link.href = link.href; // IE9, LOL! - http://jsfiddle.net/niklasvh/2e48b/
                return link.protocol + link.hostname + link.port;
            };
            CacheStorage.isSameOrigin = function (src) {
                return CacheStorage.getOrigin(src) === CacheStorage._origin;
            };
            CacheStorage.setContext = function (window) {
                CacheStorage._link = window.document.createElement('a');
                CacheStorage._origin = CacheStorage.getOrigin(window.location.href);
            };
            CacheStorage.getInstance = function () {
                var current = CacheStorage._current;
                if (current === null) {
                    throw new Error("No cache instance attached");
                }
                return current;
            };
            CacheStorage.attachInstance = function (cache) {
                CacheStorage._current = cache;
            };
            CacheStorage.detachInstance = function () {
                CacheStorage._current = null;
            };
            CacheStorage._caches = {};
            CacheStorage._origin = 'about:blank';
            CacheStorage._current = null;
            return CacheStorage;
        }());
        var Cache = /** @class */ (function () {
            function Cache(id, options) {
                this.id = id;
                this._options = options;
                this._cache = {};
            }
            Cache.prototype.addImage = function (src) {
                var result = Promise.resolve();
                if (this.has(src)) {
                    return result;
                }
                if (isBlobImage(src) || isRenderable(src)) {
                    this._cache[src] = this.loadImage(src);
                    return result;
                }
                return result;
            };
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            Cache.prototype.match = function (src) {
                return this._cache[src];
            };
            Cache.prototype.loadImage = function (key) {
                return __awaiter(this, void 0, void 0, function () {
                    var isSameOrigin, useCORS, useProxy, src;
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                isSameOrigin = CacheStorage.isSameOrigin(key);
                                useCORS = !isInlineImage(key) && this._options.useCORS === true && FEATURES.SUPPORT_CORS_IMAGES && !isSameOrigin;
                                useProxy = !isInlineImage(key) &&
                                    !isSameOrigin &&
                                    typeof this._options.proxy === 'string' &&
                                    FEATURES.SUPPORT_CORS_XHR &&
                                    !useCORS;
                                if (!isSameOrigin && this._options.allowTaint === false && !isInlineImage(key) && !useProxy && !useCORS) {
                                    return [2 /*return*/];
                                }
                                src = key;
                                if (!useProxy) return [3 /*break*/, 2];
                                return [4 /*yield*/, this.proxy(src)];
                            case 1:
                                src = _a.sent();
                                _a.label = 2;
                            case 2:
                                Logger.getInstance(this.id).debug("Added image " + key.substring(0, 256));
                                return [4 /*yield*/, new Promise(function (resolve, reject) {
                                        var img = new Image();
                                        img.onload = function () { return resolve(img); };
                                        img.onerror = reject;
                                        //ios safari 10.3 taints canvas with data urls unless crossOrigin is set to anonymous
                                        if (isInlineBase64Image(src) || useCORS) {
                                            img.crossOrigin = 'anonymous';
                                        }
                                        img.src = src;
                                        if (img.complete === true) {
                                            // Inline XML images may fail to parse, throwing an Error later on
                                            setTimeout(function () { return resolve(img); }, 500);
                                        }
                                        if (_this._options.imageTimeout > 0) {
                                            setTimeout(function () { return reject("Timed out (" + _this._options.imageTimeout + "ms) loading image"); }, _this._options.imageTimeout);
                                        }
                                    })];
                            case 3: return [2 /*return*/, _a.sent()];
                        }
                    });
                });
            };
            Cache.prototype.has = function (key) {
                return typeof this._cache[key] !== 'undefined';
            };
            Cache.prototype.keys = function () {
                return Promise.resolve(Object.keys(this._cache));
            };
            Cache.prototype.proxy = function (src) {
                var _this = this;
                var proxy = this._options.proxy;
                if (!proxy) {
                    throw new Error('No proxy defined');
                }
                var key = src.substring(0, 256);
                return new Promise(function (resolve, reject) {
                    var responseType = FEATURES.SUPPORT_RESPONSE_TYPE ? 'blob' : 'text';
                    var xhr = new XMLHttpRequest();
                    xhr.onload = function () {
                        if (xhr.status === 200) {
                            if (responseType === 'text') {
                                resolve(xhr.response);
                            }
                            else {
                                var reader_1 = new FileReader();
                                reader_1.addEventListener('load', function () { return resolve(reader_1.result); }, false);
                                reader_1.addEventListener('error', function (e) { return reject(e); }, false);
                                reader_1.readAsDataURL(xhr.response);
                            }
                        }
                        else {
                            reject("Failed to proxy resource " + key + " with status code " + xhr.status);
                        }
                    };
                    xhr.onerror = reject;
                    xhr.open('GET', proxy + "?url=" + encodeURIComponent(src) + "&responseType=" + responseType);
                    if (responseType !== 'text' && xhr instanceof XMLHttpRequest) {
                        xhr.responseType = responseType;
                    }
                    if (_this._options.imageTimeout) {
                        var timeout_1 = _this._options.imageTimeout;
                        xhr.timeout = timeout_1;
                        xhr.ontimeout = function () { return reject("Timed out (" + timeout_1 + "ms) proxying " + key); };
                    }
                    xhr.send();
                });
            };
            return Cache;
        }());
        var INLINE_SVG = /^data:image\/svg\+xml/i;
        var INLINE_BASE64 = /^data:image\/.*;base64,/i;
        var INLINE_IMG = /^data:image\/.*/i;
        var isRenderable = function (src) { return FEATURES.SUPPORT_SVG_DRAWING || !isSVG(src); };
        var isInlineImage = function (src) { return INLINE_IMG.test(src); };
        var isInlineBase64Image = function (src) { return INLINE_BASE64.test(src); };
        var isBlobImage = function (src) { return src.substr(0, 4) === 'blob'; };
        var isSVG = function (src) { return src.substr(-3).toLowerCase() === 'svg' || INLINE_SVG.test(src); };

        var webkitGradient = function (tokens) {
            var angle = deg(180);
            var stops = [];
            var type = CSSImageType.LINEAR_GRADIENT;
            var shape = CSSRadialShape.CIRCLE;
            var size = CSSRadialExtent.FARTHEST_CORNER;
            var position = [];
            parseFunctionArgs(tokens).forEach(function (arg, i) {
                var firstToken = arg[0];
                if (i === 0) {
                    if (isIdentToken(firstToken) && firstToken.value === 'linear') {
                        type = CSSImageType.LINEAR_GRADIENT;
                        return;
                    }
                    else if (isIdentToken(firstToken) && firstToken.value === 'radial') {
                        type = CSSImageType.RADIAL_GRADIENT;
                        return;
                    }
                }
                if (firstToken.type === TokenType.FUNCTION) {
                    if (firstToken.name === 'from') {
                        var color$1 = color.parse(firstToken.values[0]);
                        stops.push({ stop: ZERO_LENGTH, color: color$1 });
                    }
                    else if (firstToken.name === 'to') {
                        var color$1 = color.parse(firstToken.values[0]);
                        stops.push({ stop: HUNDRED_PERCENT, color: color$1 });
                    }
                    else if (firstToken.name === 'color-stop') {
                        var values = firstToken.values.filter(nonFunctionArgSeparator);
                        if (values.length === 2) {
                            var color$1 = color.parse(values[1]);
                            var stop_1 = values[0];
                            if (isNumberToken(stop_1)) {
                                stops.push({
                                    stop: { type: TokenType.PERCENTAGE_TOKEN, number: stop_1.number * 100, flags: stop_1.flags },
                                    color: color$1
                                });
                            }
                        }
                    }
                }
            });
            return type === CSSImageType.LINEAR_GRADIENT
                ? {
                    angle: (angle + deg(180)) % deg(360),
                    stops: stops,
                    type: type
                }
                : { size: size, shape: shape, stops: stops, position: position, type: type };
        };

        var CLOSEST_SIDE = 'closest-side';
        var FARTHEST_SIDE = 'farthest-side';
        var CLOSEST_CORNER = 'closest-corner';
        var FARTHEST_CORNER = 'farthest-corner';
        var CIRCLE = 'circle';
        var ELLIPSE = 'ellipse';
        var COVER = 'cover';
        var CONTAIN = 'contain';
        var radialGradient = function (tokens) {
            var shape = CSSRadialShape.CIRCLE;
            var size = CSSRadialExtent.FARTHEST_CORNER;
            var stops = [];
            var position = [];
            parseFunctionArgs(tokens).forEach(function (arg, i) {
                var isColorStop = true;
                if (i === 0) {
                    var isAtPosition_1 = false;
                    isColorStop = arg.reduce(function (acc, token) {
                        if (isAtPosition_1) {
                            if (isIdentToken(token)) {
                                switch (token.value) {
                                    case 'center':
                                        position.push(FIFTY_PERCENT);
                                        return acc;
                                    case 'top':
                                    case 'left':
                                        position.push(ZERO_LENGTH);
                                        return acc;
                                    case 'right':
                                    case 'bottom':
                                        position.push(HUNDRED_PERCENT);
                                        return acc;
                                }
                            }
                            else if (isLengthPercentage(token) || isLength(token)) {
                                position.push(token);
                            }
                        }
                        else if (isIdentToken(token)) {
                            switch (token.value) {
                                case CIRCLE:
                                    shape = CSSRadialShape.CIRCLE;
                                    return false;
                                case ELLIPSE:
                                    shape = CSSRadialShape.ELLIPSE;
                                    return false;
                                case 'at':
                                    isAtPosition_1 = true;
                                    return false;
                                case CLOSEST_SIDE:
                                    size = CSSRadialExtent.CLOSEST_SIDE;
                                    return false;
                                case COVER:
                                case FARTHEST_SIDE:
                                    size = CSSRadialExtent.FARTHEST_SIDE;
                                    return false;
                                case CONTAIN:
                                case CLOSEST_CORNER:
                                    size = CSSRadialExtent.CLOSEST_CORNER;
                                    return false;
                                case FARTHEST_CORNER:
                                    size = CSSRadialExtent.FARTHEST_CORNER;
                                    return false;
                            }
                        }
                        else if (isLength(token) || isLengthPercentage(token)) {
                            if (!Array.isArray(size)) {
                                size = [];
                            }
                            size.push(token);
                            return false;
                        }
                        return acc;
                    }, isColorStop);
                }
                if (isColorStop) {
                    var colorStop = parseColorStop(arg);
                    stops.push(colorStop);
                }
            });
            return { size: size, shape: shape, stops: stops, position: position, type: CSSImageType.RADIAL_GRADIENT };
        };

        var prefixRadialGradient = function (tokens) {
            var shape = CSSRadialShape.CIRCLE;
            var size = CSSRadialExtent.FARTHEST_CORNER;
            var stops = [];
            var position = [];
            parseFunctionArgs(tokens).forEach(function (arg, i) {
                var isColorStop = true;
                if (i === 0) {
                    isColorStop = arg.reduce(function (acc, token) {
                        if (isIdentToken(token)) {
                            switch (token.value) {
                                case 'center':
                                    position.push(FIFTY_PERCENT);
                                    return false;
                                case 'top':
                                case 'left':
                                    position.push(ZERO_LENGTH);
                                    return false;
                                case 'right':
                                case 'bottom':
                                    position.push(HUNDRED_PERCENT);
                                    return false;
                            }
                        }
                        else if (isLengthPercentage(token) || isLength(token)) {
                            position.push(token);
                            return false;
                        }
                        return acc;
                    }, isColorStop);
                }
                else if (i === 1) {
                    isColorStop = arg.reduce(function (acc, token) {
                        if (isIdentToken(token)) {
                            switch (token.value) {
                                case CIRCLE:
                                    shape = CSSRadialShape.CIRCLE;
                                    return false;
                                case ELLIPSE:
                                    shape = CSSRadialShape.ELLIPSE;
                                    return false;
                                case CONTAIN:
                                case CLOSEST_SIDE:
                                    size = CSSRadialExtent.CLOSEST_SIDE;
                                    return false;
                                case FARTHEST_SIDE:
                                    size = CSSRadialExtent.FARTHEST_SIDE;
                                    return false;
                                case CLOSEST_CORNER:
                                    size = CSSRadialExtent.CLOSEST_CORNER;
                                    return false;
                                case COVER:
                                case FARTHEST_CORNER:
                                    size = CSSRadialExtent.FARTHEST_CORNER;
                                    return false;
                            }
                        }
                        else if (isLength(token) || isLengthPercentage(token)) {
                            if (!Array.isArray(size)) {
                                size = [];
                            }
                            size.push(token);
                            return false;
                        }
                        return acc;
                    }, isColorStop);
                }
                if (isColorStop) {
                    var colorStop = parseColorStop(arg);
                    stops.push(colorStop);
                }
            });
            return { size: size, shape: shape, stops: stops, position: position, type: CSSImageType.RADIAL_GRADIENT };
        };

        var CSSImageType;
        (function (CSSImageType) {
            CSSImageType[CSSImageType["URL"] = 0] = "URL";
            CSSImageType[CSSImageType["LINEAR_GRADIENT"] = 1] = "LINEAR_GRADIENT";
            CSSImageType[CSSImageType["RADIAL_GRADIENT"] = 2] = "RADIAL_GRADIENT";
        })(CSSImageType || (CSSImageType = {}));
        var isLinearGradient = function (background) {
            return background.type === CSSImageType.LINEAR_GRADIENT;
        };
        var isRadialGradient = function (background) {
            return background.type === CSSImageType.RADIAL_GRADIENT;
        };
        var CSSRadialShape;
        (function (CSSRadialShape) {
            CSSRadialShape[CSSRadialShape["CIRCLE"] = 0] = "CIRCLE";
            CSSRadialShape[CSSRadialShape["ELLIPSE"] = 1] = "ELLIPSE";
        })(CSSRadialShape || (CSSRadialShape = {}));
        var CSSRadialExtent;
        (function (CSSRadialExtent) {
            CSSRadialExtent[CSSRadialExtent["CLOSEST_SIDE"] = 0] = "CLOSEST_SIDE";
            CSSRadialExtent[CSSRadialExtent["FARTHEST_SIDE"] = 1] = "FARTHEST_SIDE";
            CSSRadialExtent[CSSRadialExtent["CLOSEST_CORNER"] = 2] = "CLOSEST_CORNER";
            CSSRadialExtent[CSSRadialExtent["FARTHEST_CORNER"] = 3] = "FARTHEST_CORNER";
        })(CSSRadialExtent || (CSSRadialExtent = {}));
        var image = {
            name: 'image',
            parse: function (value) {
                if (value.type === TokenType.URL_TOKEN) {
                    var image_1 = { url: value.value, type: CSSImageType.URL };
                    CacheStorage.getInstance().addImage(value.value);
                    return image_1;
                }
                if (value.type === TokenType.FUNCTION) {
                    var imageFunction = SUPPORTED_IMAGE_FUNCTIONS[value.name];
                    if (typeof imageFunction === 'undefined') {
                        throw new Error("Attempting to parse an unsupported image function \"" + value.name + "\"");
                    }
                    return imageFunction(value.values);
                }
                throw new Error("Unsupported image type");
            }
        };
        function isSupportedImage(value) {
            return value.type !== TokenType.FUNCTION || SUPPORTED_IMAGE_FUNCTIONS[value.name];
        }
        var SUPPORTED_IMAGE_FUNCTIONS = {
            'linear-gradient': linearGradient,
            '-moz-linear-gradient': prefixLinearGradient,
            '-ms-linear-gradient': prefixLinearGradient,
            '-o-linear-gradient': prefixLinearGradient,
            '-webkit-linear-gradient': prefixLinearGradient,
            'radial-gradient': radialGradient,
            '-moz-radial-gradient': prefixRadialGradient,
            '-ms-radial-gradient': prefixRadialGradient,
            '-o-radial-gradient': prefixRadialGradient,
            '-webkit-radial-gradient': prefixRadialGradient,
            '-webkit-gradient': webkitGradient
        };

        var backgroundImage = {
            name: 'background-image',
            initialValue: 'none',
            type: PropertyDescriptorParsingType.LIST,
            prefix: false,
            parse: function (tokens) {
                if (tokens.length === 0) {
                    return [];
                }
                var first = tokens[0];
                if (first.type === TokenType.IDENT_TOKEN && first.value === 'none') {
                    return [];
                }
                return tokens.filter(function (value) { return nonFunctionArgSeparator(value) && isSupportedImage(value); }).map(image.parse);
            }
        };

        var backgroundOrigin = {
            name: 'background-origin',
            initialValue: 'border-box',
            prefix: false,
            type: PropertyDescriptorParsingType.LIST,
            parse: function (tokens) {
                return tokens.map(function (token) {
                    if (isIdentToken(token)) {
                        switch (token.value) {
                            case 'padding-box':
                                return 1 /* PADDING_BOX */;
                            case 'content-box':
                                return 2 /* CONTENT_BOX */;
                        }
                    }
                    return 0 /* BORDER_BOX */;
                });
            }
        };

        var backgroundPosition = {
            name: 'background-position',
            initialValue: '0% 0%',
            type: PropertyDescriptorParsingType.LIST,
            prefix: false,
            parse: function (tokens) {
                return parseFunctionArgs(tokens)
                    .map(function (values) { return values.filter(isLengthPercentage); })
                    .map(parseLengthPercentageTuple);
            }
        };

        var BACKGROUND_REPEAT;
        (function (BACKGROUND_REPEAT) {
            BACKGROUND_REPEAT[BACKGROUND_REPEAT["REPEAT"] = 0] = "REPEAT";
            BACKGROUND_REPEAT[BACKGROUND_REPEAT["NO_REPEAT"] = 1] = "NO_REPEAT";
            BACKGROUND_REPEAT[BACKGROUND_REPEAT["REPEAT_X"] = 2] = "REPEAT_X";
            BACKGROUND_REPEAT[BACKGROUND_REPEAT["REPEAT_Y"] = 3] = "REPEAT_Y";
        })(BACKGROUND_REPEAT || (BACKGROUND_REPEAT = {}));
        var backgroundRepeat = {
            name: 'background-repeat',
            initialValue: 'repeat',
            prefix: false,
            type: PropertyDescriptorParsingType.LIST,
            parse: function (tokens) {
                return parseFunctionArgs(tokens)
                    .map(function (values) {
                    return values
                        .filter(isIdentToken)
                        .map(function (token) { return token.value; })
                        .join(' ');
                })
                    .map(parseBackgroundRepeat);
            }
        };
        var parseBackgroundRepeat = function (value) {
            switch (value) {
                case 'no-repeat':
                    return BACKGROUND_REPEAT.NO_REPEAT;
                case 'repeat-x':
                case 'repeat no-repeat':
                    return BACKGROUND_REPEAT.REPEAT_X;
                case 'repeat-y':
                case 'no-repeat repeat':
                    return BACKGROUND_REPEAT.REPEAT_Y;
                case 'repeat':
                default:
                    return BACKGROUND_REPEAT.REPEAT;
            }
        };

        var BACKGROUND_SIZE;
        (function (BACKGROUND_SIZE) {
            BACKGROUND_SIZE["AUTO"] = "auto";
            BACKGROUND_SIZE["CONTAIN"] = "contain";
            BACKGROUND_SIZE["COVER"] = "cover";
        })(BACKGROUND_SIZE || (BACKGROUND_SIZE = {}));
        var backgroundSize = {
            name: 'background-size',
            initialValue: '0',
            prefix: false,
            type: PropertyDescriptorParsingType.LIST,
            parse: function (tokens) {
                return parseFunctionArgs(tokens).map(function (values) { return values.filter(isBackgroundSizeInfoToken); });
            }
        };
        var isBackgroundSizeInfoToken = function (value) {
            return isIdentToken(value) || isLengthPercentage(value);
        };

        var borderColorForSide = function (side) { return ({
            name: "border-" + side + "-color",
            initialValue: 'transparent',
            prefix: false,
            type: PropertyDescriptorParsingType.TYPE_VALUE,
            format: 'color'
        }); };
        var borderTopColor = borderColorForSide('top');
        var borderRightColor = borderColorForSide('right');
        var borderBottomColor = borderColorForSide('bottom');
        var borderLeftColor = borderColorForSide('left');

        var borderRadiusForSide = function (side) { return ({
            name: "border-radius-" + side,
            initialValue: '0 0',
            prefix: false,
            type: PropertyDescriptorParsingType.LIST,
            parse: function (tokens) { return parseLengthPercentageTuple(tokens.filter(isLengthPercentage)); }
        }); };
        var borderTopLeftRadius = borderRadiusForSide('top-left');
        var borderTopRightRadius = borderRadiusForSide('top-right');
        var borderBottomRightRadius = borderRadiusForSide('bottom-right');
        var borderBottomLeftRadius = borderRadiusForSide('bottom-left');

        var BORDER_STYLE;
        (function (BORDER_STYLE) {
            BORDER_STYLE[BORDER_STYLE["NONE"] = 0] = "NONE";
            BORDER_STYLE[BORDER_STYLE["SOLID"] = 1] = "SOLID";
        })(BORDER_STYLE || (BORDER_STYLE = {}));
        var borderStyleForSide = function (side) { return ({
            name: "border-" + side + "-style",
            initialValue: 'solid',
            prefix: false,
            type: PropertyDescriptorParsingType.IDENT_VALUE,
            parse: function (style) {
                switch (style) {
                    case 'none':
                        return BORDER_STYLE.NONE;
                }
                return BORDER_STYLE.SOLID;
            }
        }); };
        var borderTopStyle = borderStyleForSide('top');
        var borderRightStyle = borderStyleForSide('right');
        var borderBottomStyle = borderStyleForSide('bottom');
        var borderLeftStyle = borderStyleForSide('left');

        var borderWidthForSide = function (side) { return ({
            name: "border-" + side + "-width",
            initialValue: '0',
            type: PropertyDescriptorParsingType.VALUE,
            prefix: false,
            parse: function (token) {
                if (isDimensionToken(token)) {
                    return token.number;
                }
                return 0;
            }
        }); };
        var borderTopWidth = borderWidthForSide('top');
        var borderRightWidth = borderWidthForSide('right');
        var borderBottomWidth = borderWidthForSide('bottom');
        var borderLeftWidth = borderWidthForSide('left');

        var color$1 = {
            name: "color",
            initialValue: 'transparent',
            prefix: false,
            type: PropertyDescriptorParsingType.TYPE_VALUE,
            format: 'color'
        };

        var display = {
            name: 'display',
            initialValue: 'inline-block',
            prefix: false,
            type: PropertyDescriptorParsingType.LIST,
            parse: function (tokens) {
                return tokens.filter(isIdentToken).reduce(function (bit, token) {
                    return bit | parseDisplayValue(token.value);
                }, 0 /* NONE */);
            }
        };
        var parseDisplayValue = function (display) {
            switch (display) {
                case 'block':
                    return 2 /* BLOCK */;
                case 'inline':
                    return 4 /* INLINE */;
                case 'run-in':
                    return 8 /* RUN_IN */;
                case 'flow':
                    return 16 /* FLOW */;
                case 'flow-root':
                    return 32 /* FLOW_ROOT */;
                case 'table':
                    return 64 /* TABLE */;
                case 'flex':
                case '-webkit-flex':
                    return 128 /* FLEX */;
                case 'grid':
                case '-ms-grid':
                    return 256 /* GRID */;
                case 'ruby':
                    return 512 /* RUBY */;
                case 'subgrid':
                    return 1024 /* SUBGRID */;
                case 'list-item':
                    return 2048 /* LIST_ITEM */;
                case 'table-row-group':
                    return 4096 /* TABLE_ROW_GROUP */;
                case 'table-header-group':
                    return 8192 /* TABLE_HEADER_GROUP */;
                case 'table-footer-group':
                    return 16384 /* TABLE_FOOTER_GROUP */;
                case 'table-row':
                    return 32768 /* TABLE_ROW */;
                case 'table-cell':
                    return 65536 /* TABLE_CELL */;
                case 'table-column-group':
                    return 131072 /* TABLE_COLUMN_GROUP */;
                case 'table-column':
                    return 262144 /* TABLE_COLUMN */;
                case 'table-caption':
                    return 524288 /* TABLE_CAPTION */;
                case 'ruby-base':
                    return 1048576 /* RUBY_BASE */;
                case 'ruby-text':
                    return 2097152 /* RUBY_TEXT */;
                case 'ruby-base-container':
                    return 4194304 /* RUBY_BASE_CONTAINER */;
                case 'ruby-text-container':
                    return 8388608 /* RUBY_TEXT_CONTAINER */;
                case 'contents':
                    return 16777216 /* CONTENTS */;
                case 'inline-block':
                    return 33554432 /* INLINE_BLOCK */;
                case 'inline-list-item':
                    return 67108864 /* INLINE_LIST_ITEM */;
                case 'inline-table':
                    return 134217728 /* INLINE_TABLE */;
                case 'inline-flex':
                    return 268435456 /* INLINE_FLEX */;
                case 'inline-grid':
                    return 536870912 /* INLINE_GRID */;
            }
            return 0 /* NONE */;
        };

        var FLOAT;
        (function (FLOAT) {
            FLOAT[FLOAT["NONE"] = 0] = "NONE";
            FLOAT[FLOAT["LEFT"] = 1] = "LEFT";
            FLOAT[FLOAT["RIGHT"] = 2] = "RIGHT";
            FLOAT[FLOAT["INLINE_START"] = 3] = "INLINE_START";
            FLOAT[FLOAT["INLINE_END"] = 4] = "INLINE_END";
        })(FLOAT || (FLOAT = {}));
        var float = {
            name: 'float',
            initialValue: 'none',
            prefix: false,
            type: PropertyDescriptorParsingType.IDENT_VALUE,
            parse: function (float) {
                switch (float) {
                    case 'left':
                        return FLOAT.LEFT;
                    case 'right':
                        return FLOAT.RIGHT;
                    case 'inline-start':
                        return FLOAT.INLINE_START;
                    case 'inline-end':
                        return FLOAT.INLINE_END;
                }
                return FLOAT.NONE;
            }
        };

        var letterSpacing = {
            name: 'letter-spacing',
            initialValue: '0',
            prefix: false,
            type: PropertyDescriptorParsingType.VALUE,
            parse: function (token) {
                if (token.type === TokenType.IDENT_TOKEN && token.value === 'normal') {
                    return 0;
                }
                if (token.type === TokenType.NUMBER_TOKEN) {
                    return token.number;
                }
                if (token.type === TokenType.DIMENSION_TOKEN) {
                    return token.number;
                }
                return 0;
            }
        };

        var LINE_BREAK;
        (function (LINE_BREAK) {
            LINE_BREAK["NORMAL"] = "normal";
            LINE_BREAK["STRICT"] = "strict";
        })(LINE_BREAK || (LINE_BREAK = {}));
        var lineBreak = {
            name: 'line-break',
            initialValue: 'normal',
            prefix: false,
            type: PropertyDescriptorParsingType.IDENT_VALUE,
            parse: function (lineBreak) {
                switch (lineBreak) {
                    case 'strict':
                        return LINE_BREAK.STRICT;
                    case 'normal':
                    default:
                        return LINE_BREAK.NORMAL;
                }
            }
        };

        var lineHeight = {
            name: 'line-height',
            initialValue: 'normal',
            prefix: false,
            type: PropertyDescriptorParsingType.TOKEN_VALUE
        };
        var computeLineHeight = function (token, fontSize) {
            if (isIdentToken(token) && token.value === 'normal') {
                return 1.2 * fontSize;
            }
            else if (token.type === TokenType.NUMBER_TOKEN) {
                return fontSize * token.number;
            }
            else if (isLengthPercentage(token)) {
                return getAbsoluteValue(token, fontSize);
            }
            return fontSize;
        };

        var listStyleImage = {
            name: 'list-style-image',
            initialValue: 'none',
            type: PropertyDescriptorParsingType.VALUE,
            prefix: false,
            parse: function (token) {
                if (token.type === TokenType.IDENT_TOKEN && token.value === 'none') {
                    return null;
                }
                return image.parse(token);
            }
        };

        var LIST_STYLE_POSITION;
        (function (LIST_STYLE_POSITION) {
            LIST_STYLE_POSITION[LIST_STYLE_POSITION["INSIDE"] = 0] = "INSIDE";
            LIST_STYLE_POSITION[LIST_STYLE_POSITION["OUTSIDE"] = 1] = "OUTSIDE";
        })(LIST_STYLE_POSITION || (LIST_STYLE_POSITION = {}));
        var listStylePosition = {
            name: 'list-style-position',
            initialValue: 'outside',
            prefix: false,
            type: PropertyDescriptorParsingType.IDENT_VALUE,
            parse: function (position) {
                switch (position) {
                    case 'inside':
                        return LIST_STYLE_POSITION.INSIDE;
                    case 'outside':
                    default:
                        return LIST_STYLE_POSITION.OUTSIDE;
                }
            }
        };

        var LIST_STYLE_TYPE;
        (function (LIST_STYLE_TYPE) {
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["NONE"] = -1] = "NONE";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["DISC"] = 0] = "DISC";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["CIRCLE"] = 1] = "CIRCLE";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["SQUARE"] = 2] = "SQUARE";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["DECIMAL"] = 3] = "DECIMAL";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["CJK_DECIMAL"] = 4] = "CJK_DECIMAL";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["DECIMAL_LEADING_ZERO"] = 5] = "DECIMAL_LEADING_ZERO";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["LOWER_ROMAN"] = 6] = "LOWER_ROMAN";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["UPPER_ROMAN"] = 7] = "UPPER_ROMAN";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["LOWER_GREEK"] = 8] = "LOWER_GREEK";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["LOWER_ALPHA"] = 9] = "LOWER_ALPHA";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["UPPER_ALPHA"] = 10] = "UPPER_ALPHA";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["ARABIC_INDIC"] = 11] = "ARABIC_INDIC";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["ARMENIAN"] = 12] = "ARMENIAN";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["BENGALI"] = 13] = "BENGALI";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["CAMBODIAN"] = 14] = "CAMBODIAN";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["CJK_EARTHLY_BRANCH"] = 15] = "CJK_EARTHLY_BRANCH";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["CJK_HEAVENLY_STEM"] = 16] = "CJK_HEAVENLY_STEM";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["CJK_IDEOGRAPHIC"] = 17] = "CJK_IDEOGRAPHIC";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["DEVANAGARI"] = 18] = "DEVANAGARI";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["ETHIOPIC_NUMERIC"] = 19] = "ETHIOPIC_NUMERIC";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["GEORGIAN"] = 20] = "GEORGIAN";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["GUJARATI"] = 21] = "GUJARATI";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["GURMUKHI"] = 22] = "GURMUKHI";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["HEBREW"] = 22] = "HEBREW";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["HIRAGANA"] = 23] = "HIRAGANA";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["HIRAGANA_IROHA"] = 24] = "HIRAGANA_IROHA";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["JAPANESE_FORMAL"] = 25] = "JAPANESE_FORMAL";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["JAPANESE_INFORMAL"] = 26] = "JAPANESE_INFORMAL";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["KANNADA"] = 27] = "KANNADA";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["KATAKANA"] = 28] = "KATAKANA";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["KATAKANA_IROHA"] = 29] = "KATAKANA_IROHA";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["KHMER"] = 30] = "KHMER";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["KOREAN_HANGUL_FORMAL"] = 31] = "KOREAN_HANGUL_FORMAL";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["KOREAN_HANJA_FORMAL"] = 32] = "KOREAN_HANJA_FORMAL";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["KOREAN_HANJA_INFORMAL"] = 33] = "KOREAN_HANJA_INFORMAL";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["LAO"] = 34] = "LAO";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["LOWER_ARMENIAN"] = 35] = "LOWER_ARMENIAN";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["MALAYALAM"] = 36] = "MALAYALAM";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["MONGOLIAN"] = 37] = "MONGOLIAN";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["MYANMAR"] = 38] = "MYANMAR";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["ORIYA"] = 39] = "ORIYA";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["PERSIAN"] = 40] = "PERSIAN";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["SIMP_CHINESE_FORMAL"] = 41] = "SIMP_CHINESE_FORMAL";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["SIMP_CHINESE_INFORMAL"] = 42] = "SIMP_CHINESE_INFORMAL";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["TAMIL"] = 43] = "TAMIL";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["TELUGU"] = 44] = "TELUGU";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["THAI"] = 45] = "THAI";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["TIBETAN"] = 46] = "TIBETAN";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["TRAD_CHINESE_FORMAL"] = 47] = "TRAD_CHINESE_FORMAL";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["TRAD_CHINESE_INFORMAL"] = 48] = "TRAD_CHINESE_INFORMAL";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["UPPER_ARMENIAN"] = 49] = "UPPER_ARMENIAN";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["DISCLOSURE_OPEN"] = 50] = "DISCLOSURE_OPEN";
            LIST_STYLE_TYPE[LIST_STYLE_TYPE["DISCLOSURE_CLOSED"] = 51] = "DISCLOSURE_CLOSED";
        })(LIST_STYLE_TYPE || (LIST_STYLE_TYPE = {}));
        var listStyleType = {
            name: 'list-style-type',
            initialValue: 'none',
            prefix: false,
            type: PropertyDescriptorParsingType.IDENT_VALUE,
            parse: function (type) {
                switch (type) {
                    case 'disc':
                        return LIST_STYLE_TYPE.DISC;
                    case 'circle':
                        return LIST_STYLE_TYPE.CIRCLE;
                    case 'square':
                        return LIST_STYLE_TYPE.SQUARE;
                    case 'decimal':
                        return LIST_STYLE_TYPE.DECIMAL;
                    case 'cjk-decimal':
                        return LIST_STYLE_TYPE.CJK_DECIMAL;
                    case 'decimal-leading-zero':
                        return LIST_STYLE_TYPE.DECIMAL_LEADING_ZERO;
                    case 'lower-roman':
                        return LIST_STYLE_TYPE.LOWER_ROMAN;
                    case 'upper-roman':
                        return LIST_STYLE_TYPE.UPPER_ROMAN;
                    case 'lower-greek':
                        return LIST_STYLE_TYPE.LOWER_GREEK;
                    case 'lower-alpha':
                        return LIST_STYLE_TYPE.LOWER_ALPHA;
                    case 'upper-alpha':
                        return LIST_STYLE_TYPE.UPPER_ALPHA;
                    case 'arabic-indic':
                        return LIST_STYLE_TYPE.ARABIC_INDIC;
                    case 'armenian':
                        return LIST_STYLE_TYPE.ARMENIAN;
                    case 'bengali':
                        return LIST_STYLE_TYPE.BENGALI;
                    case 'cambodian':
                        return LIST_STYLE_TYPE.CAMBODIAN;
                    case 'cjk-earthly-branch':
                        return LIST_STYLE_TYPE.CJK_EARTHLY_BRANCH;
                    case 'cjk-heavenly-stem':
                        return LIST_STYLE_TYPE.CJK_HEAVENLY_STEM;
                    case 'cjk-ideographic':
                        return LIST_STYLE_TYPE.CJK_IDEOGRAPHIC;
                    case 'devanagari':
                        return LIST_STYLE_TYPE.DEVANAGARI;
                    case 'ethiopic-numeric':
                        return LIST_STYLE_TYPE.ETHIOPIC_NUMERIC;
                    case 'georgian':
                        return LIST_STYLE_TYPE.GEORGIAN;
                    case 'gujarati':
                        return LIST_STYLE_TYPE.GUJARATI;
                    case 'gurmukhi':
                        return LIST_STYLE_TYPE.GURMUKHI;
                    case 'hebrew':
                        return LIST_STYLE_TYPE.HEBREW;
                    case 'hiragana':
                        return LIST_STYLE_TYPE.HIRAGANA;
                    case 'hiragana-iroha':
                        return LIST_STYLE_TYPE.HIRAGANA_IROHA;
                    case 'japanese-formal':
                        return LIST_STYLE_TYPE.JAPANESE_FORMAL;
                    case 'japanese-informal':
                        return LIST_STYLE_TYPE.JAPANESE_INFORMAL;
                    case 'kannada':
                        return LIST_STYLE_TYPE.KANNADA;
                    case 'katakana':
                        return LIST_STYLE_TYPE.KATAKANA;
                    case 'katakana-iroha':
                        return LIST_STYLE_TYPE.KATAKANA_IROHA;
                    case 'khmer':
                        return LIST_STYLE_TYPE.KHMER;
                    case 'korean-hangul-formal':
                        return LIST_STYLE_TYPE.KOREAN_HANGUL_FORMAL;
                    case 'korean-hanja-formal':
                        return LIST_STYLE_TYPE.KOREAN_HANJA_FORMAL;
                    case 'korean-hanja-informal':
                        return LIST_STYLE_TYPE.KOREAN_HANJA_INFORMAL;
                    case 'lao':
                        return LIST_STYLE_TYPE.LAO;
                    case 'lower-armenian':
                        return LIST_STYLE_TYPE.LOWER_ARMENIAN;
                    case 'malayalam':
                        return LIST_STYLE_TYPE.MALAYALAM;
                    case 'mongolian':
                        return LIST_STYLE_TYPE.MONGOLIAN;
                    case 'myanmar':
                        return LIST_STYLE_TYPE.MYANMAR;
                    case 'oriya':
                        return LIST_STYLE_TYPE.ORIYA;
                    case 'persian':
                        return LIST_STYLE_TYPE.PERSIAN;
                    case 'simp-chinese-formal':
                        return LIST_STYLE_TYPE.SIMP_CHINESE_FORMAL;
                    case 'simp-chinese-informal':
                        return LIST_STYLE_TYPE.SIMP_CHINESE_INFORMAL;
                    case 'tamil':
                        return LIST_STYLE_TYPE.TAMIL;
                    case 'telugu':
                        return LIST_STYLE_TYPE.TELUGU;
                    case 'thai':
                        return LIST_STYLE_TYPE.THAI;
                    case 'tibetan':
                        return LIST_STYLE_TYPE.TIBETAN;
                    case 'trad-chinese-formal':
                        return LIST_STYLE_TYPE.TRAD_CHINESE_FORMAL;
                    case 'trad-chinese-informal':
                        return LIST_STYLE_TYPE.TRAD_CHINESE_INFORMAL;
                    case 'upper-armenian':
                        return LIST_STYLE_TYPE.UPPER_ARMENIAN;
                    case 'disclosure-open':
                        return LIST_STYLE_TYPE.DISCLOSURE_OPEN;
                    case 'disclosure-closed':
                        return LIST_STYLE_TYPE.DISCLOSURE_CLOSED;
                    case 'none':
                    default:
                        return LIST_STYLE_TYPE.NONE;
                }
            }
        };

        var marginForSide = function (side) { return ({
            name: "margin-" + side,
            initialValue: '0',
            prefix: false,
            type: PropertyDescriptorParsingType.TOKEN_VALUE
        }); };
        var marginTop = marginForSide('top');
        var marginRight = marginForSide('right');
        var marginBottom = marginForSide('bottom');
        var marginLeft = marginForSide('left');

        var OVERFLOW;
        (function (OVERFLOW) {
            OVERFLOW[OVERFLOW["VISIBLE"] = 0] = "VISIBLE";
            OVERFLOW[OVERFLOW["HIDDEN"] = 1] = "HIDDEN";
            OVERFLOW[OVERFLOW["SCROLL"] = 2] = "SCROLL";
            OVERFLOW[OVERFLOW["AUTO"] = 3] = "AUTO";
        })(OVERFLOW || (OVERFLOW = {}));
        var overflow = {
            name: 'overflow',
            initialValue: 'visible',
            prefix: false,
            type: PropertyDescriptorParsingType.LIST,
            parse: function (tokens) {
                return tokens.filter(isIdentToken).map(function (overflow) {
                    switch (overflow.value) {
                        case 'hidden':
                            return OVERFLOW.HIDDEN;
                        case 'scroll':
                            return OVERFLOW.SCROLL;
                        case 'auto':
                            return OVERFLOW.AUTO;
                        case 'visible':
                        default:
                            return OVERFLOW.VISIBLE;
                    }
                });
            }
        };

        var OVERFLOW_WRAP;
        (function (OVERFLOW_WRAP) {
            OVERFLOW_WRAP["NORMAL"] = "normal";
            OVERFLOW_WRAP["BREAK_WORD"] = "break-word";
        })(OVERFLOW_WRAP || (OVERFLOW_WRAP = {}));
        var overflowWrap = {
            name: 'overflow-wrap',
            initialValue: 'normal',
            prefix: false,
            type: PropertyDescriptorParsingType.IDENT_VALUE,
            parse: function (overflow) {
                switch (overflow) {
                    case 'break-word':
                        return OVERFLOW_WRAP.BREAK_WORD;
                    case 'normal':
                    default:
                        return OVERFLOW_WRAP.NORMAL;
                }
            }
        };

        var paddingForSide = function (side) { return ({
            name: "padding-" + side,
            initialValue: '0',
            prefix: false,
            type: PropertyDescriptorParsingType.TYPE_VALUE,
            format: 'length-percentage'
        }); };
        var paddingTop = paddingForSide('top');
        var paddingRight = paddingForSide('right');
        var paddingBottom = paddingForSide('bottom');
        var paddingLeft = paddingForSide('left');

        var TEXT_ALIGN;
        (function (TEXT_ALIGN) {
            TEXT_ALIGN[TEXT_ALIGN["LEFT"] = 0] = "LEFT";
            TEXT_ALIGN[TEXT_ALIGN["CENTER"] = 1] = "CENTER";
            TEXT_ALIGN[TEXT_ALIGN["RIGHT"] = 2] = "RIGHT";
        })(TEXT_ALIGN || (TEXT_ALIGN = {}));
        var textAlign = {
            name: 'text-align',
            initialValue: 'left',
            prefix: false,
            type: PropertyDescriptorParsingType.IDENT_VALUE,
            parse: function (textAlign) {
                switch (textAlign) {
                    case 'right':
                        return TEXT_ALIGN.RIGHT;
                    case 'center':
                    case 'justify':
                        return TEXT_ALIGN.CENTER;
                    case 'left':
                    default:
                        return TEXT_ALIGN.LEFT;
                }
            }
        };

        var POSITION;
        (function (POSITION) {
            POSITION[POSITION["STATIC"] = 0] = "STATIC";
            POSITION[POSITION["RELATIVE"] = 1] = "RELATIVE";
            POSITION[POSITION["ABSOLUTE"] = 2] = "ABSOLUTE";
            POSITION[POSITION["FIXED"] = 3] = "FIXED";
            POSITION[POSITION["STICKY"] = 4] = "STICKY";
        })(POSITION || (POSITION = {}));
        var position = {
            name: 'position',
            initialValue: 'static',
            prefix: false,
            type: PropertyDescriptorParsingType.IDENT_VALUE,
            parse: function (position) {
                switch (position) {
                    case 'relative':
                        return POSITION.RELATIVE;
                    case 'absolute':
                        return POSITION.ABSOLUTE;
                    case 'fixed':
                        return POSITION.FIXED;
                    case 'sticky':
                        return POSITION.STICKY;
                }
                return POSITION.STATIC;
            }
        };

        var textShadow = {
            name: 'text-shadow',
            initialValue: 'none',
            type: PropertyDescriptorParsingType.LIST,
            prefix: false,
            parse: function (tokens) {
                if (tokens.length === 1 && isIdentWithValue(tokens[0], 'none')) {
                    return [];
                }
                return parseFunctionArgs(tokens).map(function (values) {
                    var shadow = {
                        color: COLORS.TRANSPARENT,
                        offsetX: ZERO_LENGTH,
                        offsetY: ZERO_LENGTH,
                        blur: ZERO_LENGTH
                    };
                    var c = 0;
                    for (var i = 0; i < values.length; i++) {
                        var token = values[i];
                        if (isLength(token)) {
                            if (c === 0) {
                                shadow.offsetX = token;
                            }
                            else if (c === 1) {
                                shadow.offsetY = token;
                            }
                            else {
                                shadow.blur = token;
                            }
                            c++;
                        }
                        else {
                            shadow.color = color.parse(token);
                        }
                    }
                    return shadow;
                });
            }
        };

        var TEXT_TRANSFORM;
        (function (TEXT_TRANSFORM) {
            TEXT_TRANSFORM[TEXT_TRANSFORM["NONE"] = 0] = "NONE";
            TEXT_TRANSFORM[TEXT_TRANSFORM["LOWERCASE"] = 1] = "LOWERCASE";
            TEXT_TRANSFORM[TEXT_TRANSFORM["UPPERCASE"] = 2] = "UPPERCASE";
            TEXT_TRANSFORM[TEXT_TRANSFORM["CAPITALIZE"] = 3] = "CAPITALIZE";
        })(TEXT_TRANSFORM || (TEXT_TRANSFORM = {}));
        var textTransform = {
            name: 'text-transform',
            initialValue: 'none',
            prefix: false,
            type: PropertyDescriptorParsingType.IDENT_VALUE,
            parse: function (textTransform) {
                switch (textTransform) {
                    case 'uppercase':
                        return TEXT_TRANSFORM.UPPERCASE;
                    case 'lowercase':
                        return TEXT_TRANSFORM.LOWERCASE;
                    case 'capitalize':
                        return TEXT_TRANSFORM.CAPITALIZE;
                }
                return TEXT_TRANSFORM.NONE;
            }
        };

        var transform = {
            name: 'transform',
            initialValue: 'none',
            prefix: true,
            type: PropertyDescriptorParsingType.VALUE,
            parse: function (token) {
                if (token.type === TokenType.IDENT_TOKEN && token.value === 'none') {
                    return null;
                }
                if (token.type === TokenType.FUNCTION) {
                    var transformFunction = SUPPORTED_TRANSFORM_FUNCTIONS[token.name];
                    if (typeof transformFunction === 'undefined') {
                        throw new Error("Attempting to parse an unsupported transform function \"" + token.name + "\"");
                    }
                    return transformFunction(token.values);
                }
                return null;
            }
        };
        var matrix = function (args) {
            var values = args.filter(function (arg) { return arg.type === TokenType.NUMBER_TOKEN; }).map(function (arg) { return arg.number; });
            return values.length === 6 ? values : null;
        };
        // doesn't support 3D transforms at the moment
        var matrix3d = function (args) {
            var values = args.filter(function (arg) { return arg.type === TokenType.NUMBER_TOKEN; }).map(function (arg) { return arg.number; });
            var a1 = values[0], b1 = values[1]; values[2]; values[3]; var a2 = values[4], b2 = values[5]; values[6]; values[7]; values[8]; values[9]; values[10]; values[11]; var a4 = values[12], b4 = values[13]; values[14]; values[15];
            return values.length === 16 ? [a1, b1, a2, b2, a4, b4] : null;
        };
        var SUPPORTED_TRANSFORM_FUNCTIONS = {
            matrix: matrix,
            matrix3d: matrix3d
        };

        var DEFAULT_VALUE = {
            type: TokenType.PERCENTAGE_TOKEN,
            number: 50,
            flags: FLAG_INTEGER
        };
        var DEFAULT = [DEFAULT_VALUE, DEFAULT_VALUE];
        var transformOrigin = {
            name: 'transform-origin',
            initialValue: '50% 50%',
            prefix: true,
            type: PropertyDescriptorParsingType.LIST,
            parse: function (tokens) {
                var origins = tokens.filter(isLengthPercentage);
                if (origins.length !== 2) {
                    return DEFAULT;
                }
                return [origins[0], origins[1]];
            }
        };

        var VISIBILITY;
        (function (VISIBILITY) {
            VISIBILITY[VISIBILITY["VISIBLE"] = 0] = "VISIBLE";
            VISIBILITY[VISIBILITY["HIDDEN"] = 1] = "HIDDEN";
            VISIBILITY[VISIBILITY["COLLAPSE"] = 2] = "COLLAPSE";
        })(VISIBILITY || (VISIBILITY = {}));
        var visibility = {
            name: 'visible',
            initialValue: 'none',
            prefix: false,
            type: PropertyDescriptorParsingType.IDENT_VALUE,
            parse: function (visibility) {
                switch (visibility) {
                    case 'hidden':
                        return VISIBILITY.HIDDEN;
                    case 'collapse':
                        return VISIBILITY.COLLAPSE;
                    case 'visible':
                    default:
                        return VISIBILITY.VISIBLE;
                }
            }
        };

        var WORD_BREAK;
        (function (WORD_BREAK) {
            WORD_BREAK["NORMAL"] = "normal";
            WORD_BREAK["BREAK_ALL"] = "break-all";
            WORD_BREAK["KEEP_ALL"] = "keep-all";
        })(WORD_BREAK || (WORD_BREAK = {}));
        var wordBreak = {
            name: 'word-break',
            initialValue: 'normal',
            prefix: false,
            type: PropertyDescriptorParsingType.IDENT_VALUE,
            parse: function (wordBreak) {
                switch (wordBreak) {
                    case 'break-all':
                        return WORD_BREAK.BREAK_ALL;
                    case 'keep-all':
                        return WORD_BREAK.KEEP_ALL;
                    case 'normal':
                    default:
                        return WORD_BREAK.NORMAL;
                }
            }
        };

        var zIndex = {
            name: 'z-index',
            initialValue: 'auto',
            prefix: false,
            type: PropertyDescriptorParsingType.VALUE,
            parse: function (token) {
                if (token.type === TokenType.IDENT_TOKEN) {
                    return { auto: true, order: 0 };
                }
                if (isNumberToken(token)) {
                    return { auto: false, order: token.number };
                }
                throw new Error("Invalid z-index number parsed");
            }
        };

        var opacity = {
            name: 'opacity',
            initialValue: '1',
            type: PropertyDescriptorParsingType.VALUE,
            prefix: false,
            parse: function (token) {
                if (isNumberToken(token)) {
                    return token.number;
                }
                return 1;
            }
        };

        var textDecorationColor = {
            name: "text-decoration-color",
            initialValue: 'transparent',
            prefix: false,
            type: PropertyDescriptorParsingType.TYPE_VALUE,
            format: 'color'
        };

        var textDecorationLine = {
            name: 'text-decoration-line',
            initialValue: 'none',
            prefix: false,
            type: PropertyDescriptorParsingType.LIST,
            parse: function (tokens) {
                return tokens
                    .filter(isIdentToken)
                    .map(function (token) {
                    switch (token.value) {
                        case 'underline':
                            return 1 /* UNDERLINE */;
                        case 'overline':
                            return 2 /* OVERLINE */;
                        case 'line-through':
                            return 3 /* LINE_THROUGH */;
                        case 'none':
                            return 4 /* BLINK */;
                    }
                    return 0 /* NONE */;
                })
                    .filter(function (line) { return line !== 0 /* NONE */; });
            }
        };

        var fontFamily = {
            name: "font-family",
            initialValue: '',
            prefix: false,
            type: PropertyDescriptorParsingType.LIST,
            parse: function (tokens) {
                var accumulator = [];
                var results = [];
                tokens.forEach(function (token) {
                    switch (token.type) {
                        case TokenType.IDENT_TOKEN:
                        case TokenType.STRING_TOKEN:
                            accumulator.push(token.value);
                            break;
                        case TokenType.NUMBER_TOKEN:
                            accumulator.push(token.number.toString());
                            break;
                        case TokenType.COMMA_TOKEN:
                            results.push(accumulator.join(' '));
                            accumulator.length = 0;
                            break;
                    }
                });
                if (accumulator.length) {
                    results.push(accumulator.join(' '));
                }
                return results.map(function (result) { return (result.indexOf(' ') === -1 ? result : "'" + result + "'"); });
            }
        };

        var fontSize = {
            name: "font-size",
            initialValue: '0',
            prefix: false,
            type: PropertyDescriptorParsingType.TYPE_VALUE,
            format: 'length'
        };

        var fontWeight = {
            name: 'font-weight',
            initialValue: 'normal',
            type: PropertyDescriptorParsingType.VALUE,
            prefix: false,
            parse: function (token) {
                if (isNumberToken(token)) {
                    return token.number;
                }
                if (isIdentToken(token)) {
                    switch (token.value) {
                        case 'bold':
                            return 700;
                        case 'normal':
                        default:
                            return 400;
                    }
                }
                return 400;
            }
        };

        var fontVariant = {
            name: 'font-variant',
            initialValue: 'none',
            type: PropertyDescriptorParsingType.LIST,
            prefix: false,
            parse: function (tokens) {
                return tokens.filter(isIdentToken).map(function (token) { return token.value; });
            }
        };

        var FONT_STYLE;
        (function (FONT_STYLE) {
            FONT_STYLE["NORMAL"] = "normal";
            FONT_STYLE["ITALIC"] = "italic";
            FONT_STYLE["OBLIQUE"] = "oblique";
        })(FONT_STYLE || (FONT_STYLE = {}));
        var fontStyle = {
            name: 'font-style',
            initialValue: 'normal',
            prefix: false,
            type: PropertyDescriptorParsingType.IDENT_VALUE,
            parse: function (overflow) {
                switch (overflow) {
                    case 'oblique':
                        return FONT_STYLE.OBLIQUE;
                    case 'italic':
                        return FONT_STYLE.ITALIC;
                    case 'normal':
                    default:
                        return FONT_STYLE.NORMAL;
                }
            }
        };

        var contains = function (bit, value) { return (bit & value) !== 0; };

        var content = {
            name: 'content',
            initialValue: 'none',
            type: PropertyDescriptorParsingType.LIST,
            prefix: false,
            parse: function (tokens) {
                if (tokens.length === 0) {
                    return [];
                }
                var first = tokens[0];
                if (first.type === TokenType.IDENT_TOKEN && first.value === 'none') {
                    return [];
                }
                return tokens;
            }
        };

        var counterIncrement = {
            name: 'counter-increment',
            initialValue: 'none',
            prefix: true,
            type: PropertyDescriptorParsingType.LIST,
            parse: function (tokens) {
                if (tokens.length === 0) {
                    return null;
                }
                var first = tokens[0];
                if (first.type === TokenType.IDENT_TOKEN && first.value === 'none') {
                    return null;
                }
                var increments = [];
                var filtered = tokens.filter(nonWhiteSpace);
                for (var i = 0; i < filtered.length; i++) {
                    var counter = filtered[i];
                    var next = filtered[i + 1];
                    if (counter.type === TokenType.IDENT_TOKEN) {
                        var increment = next && isNumberToken(next) ? next.number : 1;
                        increments.push({ counter: counter.value, increment: increment });
                    }
                }
                return increments;
            }
        };

        var counterReset = {
            name: 'counter-reset',
            initialValue: 'none',
            prefix: true,
            type: PropertyDescriptorParsingType.LIST,
            parse: function (tokens) {
                if (tokens.length === 0) {
                    return [];
                }
                var resets = [];
                var filtered = tokens.filter(nonWhiteSpace);
                for (var i = 0; i < filtered.length; i++) {
                    var counter = filtered[i];
                    var next = filtered[i + 1];
                    if (isIdentToken(counter) && counter.value !== 'none') {
                        var reset = next && isNumberToken(next) ? next.number : 0;
                        resets.push({ counter: counter.value, reset: reset });
                    }
                }
                return resets;
            }
        };

        var quotes = {
            name: 'quotes',
            initialValue: 'none',
            prefix: true,
            type: PropertyDescriptorParsingType.LIST,
            parse: function (tokens) {
                if (tokens.length === 0) {
                    return null;
                }
                var first = tokens[0];
                if (first.type === TokenType.IDENT_TOKEN && first.value === 'none') {
                    return null;
                }
                var quotes = [];
                var filtered = tokens.filter(isStringToken);
                if (filtered.length % 2 !== 0) {
                    return null;
                }
                for (var i = 0; i < filtered.length; i += 2) {
                    var open_1 = filtered[i].value;
                    var close_1 = filtered[i + 1].value;
                    quotes.push({ open: open_1, close: close_1 });
                }
                return quotes;
            }
        };
        var getQuote = function (quotes, depth, open) {
            if (!quotes) {
                return '';
            }
            var quote = quotes[Math.min(depth, quotes.length - 1)];
            if (!quote) {
                return '';
            }
            return open ? quote.open : quote.close;
        };

        var boxShadow = {
            name: 'box-shadow',
            initialValue: 'none',
            type: PropertyDescriptorParsingType.LIST,
            prefix: false,
            parse: function (tokens) {
                if (tokens.length === 1 && isIdentWithValue(tokens[0], 'none')) {
                    return [];
                }
                return parseFunctionArgs(tokens).map(function (values) {
                    var shadow = {
                        color: 0x000000ff,
                        offsetX: ZERO_LENGTH,
                        offsetY: ZERO_LENGTH,
                        blur: ZERO_LENGTH,
                        spread: ZERO_LENGTH,
                        inset: false
                    };
                    var c = 0;
                    for (var i = 0; i < values.length; i++) {
                        var token = values[i];
                        if (isIdentWithValue(token, 'inset')) {
                            shadow.inset = true;
                        }
                        else if (isLength(token)) {
                            if (c === 0) {
                                shadow.offsetX = token;
                            }
                            else if (c === 1) {
                                shadow.offsetY = token;
                            }
                            else if (c === 2) {
                                shadow.blur = token;
                            }
                            else {
                                shadow.spread = token;
                            }
                            c++;
                        }
                        else {
                            shadow.color = color.parse(token);
                        }
                    }
                    return shadow;
                });
            }
        };

        var CSSParsedDeclaration = /** @class */ (function () {
            function CSSParsedDeclaration(declaration) {
                this.backgroundClip = parse(backgroundClip, declaration.backgroundClip);
                this.backgroundColor = parse(backgroundColor, declaration.backgroundColor);
                this.backgroundImage = parse(backgroundImage, declaration.backgroundImage);
                this.backgroundOrigin = parse(backgroundOrigin, declaration.backgroundOrigin);
                this.backgroundPosition = parse(backgroundPosition, declaration.backgroundPosition);
                this.backgroundRepeat = parse(backgroundRepeat, declaration.backgroundRepeat);
                this.backgroundSize = parse(backgroundSize, declaration.backgroundSize);
                this.borderTopColor = parse(borderTopColor, declaration.borderTopColor);
                this.borderRightColor = parse(borderRightColor, declaration.borderRightColor);
                this.borderBottomColor = parse(borderBottomColor, declaration.borderBottomColor);
                this.borderLeftColor = parse(borderLeftColor, declaration.borderLeftColor);
                this.borderTopLeftRadius = parse(borderTopLeftRadius, declaration.borderTopLeftRadius);
                this.borderTopRightRadius = parse(borderTopRightRadius, declaration.borderTopRightRadius);
                this.borderBottomRightRadius = parse(borderBottomRightRadius, declaration.borderBottomRightRadius);
                this.borderBottomLeftRadius = parse(borderBottomLeftRadius, declaration.borderBottomLeftRadius);
                this.borderTopStyle = parse(borderTopStyle, declaration.borderTopStyle);
                this.borderRightStyle = parse(borderRightStyle, declaration.borderRightStyle);
                this.borderBottomStyle = parse(borderBottomStyle, declaration.borderBottomStyle);
                this.borderLeftStyle = parse(borderLeftStyle, declaration.borderLeftStyle);
                this.borderTopWidth = parse(borderTopWidth, declaration.borderTopWidth);
                this.borderRightWidth = parse(borderRightWidth, declaration.borderRightWidth);
                this.borderBottomWidth = parse(borderBottomWidth, declaration.borderBottomWidth);
                this.borderLeftWidth = parse(borderLeftWidth, declaration.borderLeftWidth);
                this.boxShadow = parse(boxShadow, declaration.boxShadow);
                this.color = parse(color$1, declaration.color);
                this.display = parse(display, declaration.display);
                this.float = parse(float, declaration.cssFloat);
                this.fontFamily = parse(fontFamily, declaration.fontFamily);
                this.fontSize = parse(fontSize, declaration.fontSize);
                this.fontStyle = parse(fontStyle, declaration.fontStyle);
                this.fontVariant = parse(fontVariant, declaration.fontVariant);
                this.fontWeight = parse(fontWeight, declaration.fontWeight);
                this.letterSpacing = parse(letterSpacing, declaration.letterSpacing);
                this.lineBreak = parse(lineBreak, declaration.lineBreak);
                this.lineHeight = parse(lineHeight, declaration.lineHeight);
                this.listStyleImage = parse(listStyleImage, declaration.listStyleImage);
                this.listStylePosition = parse(listStylePosition, declaration.listStylePosition);
                this.listStyleType = parse(listStyleType, declaration.listStyleType);
                this.marginTop = parse(marginTop, declaration.marginTop);
                this.marginRight = parse(marginRight, declaration.marginRight);
                this.marginBottom = parse(marginBottom, declaration.marginBottom);
                this.marginLeft = parse(marginLeft, declaration.marginLeft);
                this.opacity = parse(opacity, declaration.opacity);
                var overflowTuple = parse(overflow, declaration.overflow);
                this.overflowX = overflowTuple[0];
                this.overflowY = overflowTuple[overflowTuple.length > 1 ? 1 : 0];
                this.overflowWrap = parse(overflowWrap, declaration.overflowWrap);
                this.paddingTop = parse(paddingTop, declaration.paddingTop);
                this.paddingRight = parse(paddingRight, declaration.paddingRight);
                this.paddingBottom = parse(paddingBottom, declaration.paddingBottom);
                this.paddingLeft = parse(paddingLeft, declaration.paddingLeft);
                this.position = parse(position, declaration.position);
                this.textAlign = parse(textAlign, declaration.textAlign);
                this.textDecorationColor = parse(textDecorationColor, declaration.textDecorationColor || declaration.color);
                this.textDecorationLine = parse(textDecorationLine, declaration.textDecorationLine);
                this.textShadow = parse(textShadow, declaration.textShadow);
                this.textTransform = parse(textTransform, declaration.textTransform);
                this.transform = parse(transform, declaration.transform);
                this.transformOrigin = parse(transformOrigin, declaration.transformOrigin);
                this.visibility = parse(visibility, declaration.visibility);
                this.wordBreak = parse(wordBreak, declaration.wordBreak);
                this.zIndex = parse(zIndex, declaration.zIndex);
            }
            CSSParsedDeclaration.prototype.isVisible = function () {
                return this.display > 0 && this.opacity > 0 && this.visibility === VISIBILITY.VISIBLE;
            };
            CSSParsedDeclaration.prototype.isTransparent = function () {
                return isTransparent(this.backgroundColor);
            };
            CSSParsedDeclaration.prototype.isTransformed = function () {
                return this.transform !== null;
            };
            CSSParsedDeclaration.prototype.isPositioned = function () {
                return this.position !== POSITION.STATIC;
            };
            CSSParsedDeclaration.prototype.isPositionedWithZIndex = function () {
                return this.isPositioned() && !this.zIndex.auto;
            };
            CSSParsedDeclaration.prototype.isFloating = function () {
                return this.float !== FLOAT.NONE;
            };
            CSSParsedDeclaration.prototype.isInlineLevel = function () {
                return (contains(this.display, 4 /* INLINE */) ||
                    contains(this.display, 33554432 /* INLINE_BLOCK */) ||
                    contains(this.display, 268435456 /* INLINE_FLEX */) ||
                    contains(this.display, 536870912 /* INLINE_GRID */) ||
                    contains(this.display, 67108864 /* INLINE_LIST_ITEM */) ||
                    contains(this.display, 134217728 /* INLINE_TABLE */));
            };
            return CSSParsedDeclaration;
        }());
        var CSSParsedPseudoDeclaration = /** @class */ (function () {
            function CSSParsedPseudoDeclaration(declaration) {
                this.content = parse(content, declaration.content);
                this.quotes = parse(quotes, declaration.quotes);
            }
            return CSSParsedPseudoDeclaration;
        }());
        var CSSParsedCounterDeclaration = /** @class */ (function () {
            function CSSParsedCounterDeclaration(declaration) {
                this.counterIncrement = parse(counterIncrement, declaration.counterIncrement);
                this.counterReset = parse(counterReset, declaration.counterReset);
            }
            return CSSParsedCounterDeclaration;
        }());
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        var parse = function (descriptor, style) {
            var tokenizer = new Tokenizer();
            var value = style !== null && typeof style !== 'undefined' ? style.toString() : descriptor.initialValue;
            tokenizer.write(value);
            var parser = new Parser(tokenizer.read());
            switch (descriptor.type) {
                case PropertyDescriptorParsingType.IDENT_VALUE:
                    var token = parser.parseComponentValue();
                    return descriptor.parse(isIdentToken(token) ? token.value : descriptor.initialValue);
                case PropertyDescriptorParsingType.VALUE:
                    return descriptor.parse(parser.parseComponentValue());
                case PropertyDescriptorParsingType.LIST:
                    return descriptor.parse(parser.parseComponentValues());
                case PropertyDescriptorParsingType.TOKEN_VALUE:
                    return parser.parseComponentValue();
                case PropertyDescriptorParsingType.TYPE_VALUE:
                    switch (descriptor.format) {
                        case 'angle':
                            return angle.parse(parser.parseComponentValue());
                        case 'color':
                            return color.parse(parser.parseComponentValue());
                        case 'image':
                            return image.parse(parser.parseComponentValue());
                        case 'length':
                            var length_1 = parser.parseComponentValue();
                            return isLength(length_1) ? length_1 : ZERO_LENGTH;
                        case 'length-percentage':
                            var value_1 = parser.parseComponentValue();
                            return isLengthPercentage(value_1) ? value_1 : ZERO_LENGTH;
                    }
            }
            throw new Error("Attempting to parse unsupported css format type " + descriptor.format);
        };

        var ElementContainer = /** @class */ (function () {
            function ElementContainer(element) {
                this.styles = new CSSParsedDeclaration(window.getComputedStyle(element, null));
                this.textNodes = [];
                this.elements = [];
                if (this.styles.transform !== null && isHTMLElementNode(element)) {
                    // getBoundingClientRect takes transforms into account
                    element.style.transform = 'none';
                }
                this.bounds = parseBounds(element);
                this.flags = 0;
            }
            return ElementContainer;
        }());

        var TextBounds = /** @class */ (function () {
            function TextBounds(text, bounds) {
                this.text = text;
                this.bounds = bounds;
            }
            return TextBounds;
        }());
        var parseTextBounds = function (value, styles, node) {
            var textList = breakText(value, styles);
            var textBounds = [];
            var offset = 0;
            textList.forEach(function (text) {
                if (styles.textDecorationLine.length || text.trim().length > 0) {
                    if (FEATURES.SUPPORT_RANGE_BOUNDS) {
                        textBounds.push(new TextBounds(text, getRangeBounds(node, offset, text.length)));
                    }
                    else {
                        var replacementNode = node.splitText(text.length);
                        textBounds.push(new TextBounds(text, getWrapperBounds(node)));
                        node = replacementNode;
                    }
                }
                else if (!FEATURES.SUPPORT_RANGE_BOUNDS) {
                    node = node.splitText(text.length);
                }
                offset += text.length;
            });
            return textBounds;
        };
        var getWrapperBounds = function (node) {
            var ownerDocument = node.ownerDocument;
            if (ownerDocument) {
                var wrapper = ownerDocument.createElement('html2canvaswrapper');
                wrapper.appendChild(node.cloneNode(true));
                var parentNode = node.parentNode;
                if (parentNode) {
                    parentNode.replaceChild(wrapper, node);
                    var bounds = parseBounds(wrapper);
                    if (wrapper.firstChild) {
                        parentNode.replaceChild(wrapper.firstChild, wrapper);
                    }
                    return bounds;
                }
            }
            return new Bounds(0, 0, 0, 0);
        };
        var getRangeBounds = function (node, offset, length) {
            var ownerDocument = node.ownerDocument;
            if (!ownerDocument) {
                throw new Error('Node has no owner document');
            }
            var range = ownerDocument.createRange();
            range.setStart(node, offset);
            range.setEnd(node, offset + length);
            return Bounds.fromClientRect(range.getBoundingClientRect());
        };
        var breakText = function (value, styles) {
            return styles.letterSpacing !== 0 ? toCodePoints(value).map(function (i) { return fromCodePoint(i); }) : breakWords(value, styles);
        };
        var breakWords = function (str, styles) {
            var breaker = LineBreaker(str, {
                lineBreak: styles.lineBreak,
                wordBreak: styles.overflowWrap === OVERFLOW_WRAP.BREAK_WORD ? 'break-word' : styles.wordBreak
            });
            var words = [];
            var bk;
            while (!(bk = breaker.next()).done) {
                if (bk.value) {
                    words.push(bk.value.slice());
                }
            }
            return words;
        };

        var TextContainer = /** @class */ (function () {
            function TextContainer(node, styles) {
                this.text = transform$1(node.data, styles.textTransform);
                this.textBounds = parseTextBounds(this.text, styles, node);
            }
            return TextContainer;
        }());
        var transform$1 = function (text, transform) {
            switch (transform) {
                case TEXT_TRANSFORM.LOWERCASE:
                    return text.toLowerCase();
                case TEXT_TRANSFORM.CAPITALIZE:
                    return text.replace(CAPITALIZE, capitalize);
                case TEXT_TRANSFORM.UPPERCASE:
                    return text.toUpperCase();
                default:
                    return text;
            }
        };
        var CAPITALIZE = /(^|\s|:|-|\(|\))([a-z])/g;
        var capitalize = function (m, p1, p2) {
            if (m.length > 0) {
                return p1 + p2.toUpperCase();
            }
            return m;
        };

        var ImageElementContainer = /** @class */ (function (_super) {
            __extends(ImageElementContainer, _super);
            function ImageElementContainer(img) {
                var _this = _super.call(this, img) || this;
                _this.src = img.currentSrc || img.src;
                _this.intrinsicWidth = img.naturalWidth;
                _this.intrinsicHeight = img.naturalHeight;
                CacheStorage.getInstance().addImage(_this.src);
                return _this;
            }
            return ImageElementContainer;
        }(ElementContainer));

        var CanvasElementContainer = /** @class */ (function (_super) {
            __extends(CanvasElementContainer, _super);
            function CanvasElementContainer(canvas) {
                var _this = _super.call(this, canvas) || this;
                _this.canvas = canvas;
                _this.intrinsicWidth = canvas.width;
                _this.intrinsicHeight = canvas.height;
                return _this;
            }
            return CanvasElementContainer;
        }(ElementContainer));

        var SVGElementContainer = /** @class */ (function (_super) {
            __extends(SVGElementContainer, _super);
            function SVGElementContainer(img) {
                var _this = _super.call(this, img) || this;
                var s = new XMLSerializer();
                _this.svg = "data:image/svg+xml," + encodeURIComponent(s.serializeToString(img));
                _this.intrinsicWidth = img.width.baseVal.value;
                _this.intrinsicHeight = img.height.baseVal.value;
                CacheStorage.getInstance().addImage(_this.svg);
                return _this;
            }
            return SVGElementContainer;
        }(ElementContainer));

        var LIElementContainer = /** @class */ (function (_super) {
            __extends(LIElementContainer, _super);
            function LIElementContainer(element) {
                var _this = _super.call(this, element) || this;
                _this.value = element.value;
                return _this;
            }
            return LIElementContainer;
        }(ElementContainer));

        var OLElementContainer = /** @class */ (function (_super) {
            __extends(OLElementContainer, _super);
            function OLElementContainer(element) {
                var _this = _super.call(this, element) || this;
                _this.start = element.start;
                _this.reversed = typeof element.reversed === 'boolean' && element.reversed === true;
                return _this;
            }
            return OLElementContainer;
        }(ElementContainer));

        var CHECKBOX_BORDER_RADIUS = [
            {
                type: TokenType.DIMENSION_TOKEN,
                flags: 0,
                unit: 'px',
                number: 3
            }
        ];
        var RADIO_BORDER_RADIUS = [
            {
                type: TokenType.PERCENTAGE_TOKEN,
                flags: 0,
                number: 50
            }
        ];
        var reformatInputBounds = function (bounds) {
            if (bounds.width > bounds.height) {
                return new Bounds(bounds.left + (bounds.width - bounds.height) / 2, bounds.top, bounds.height, bounds.height);
            }
            else if (bounds.width < bounds.height) {
                return new Bounds(bounds.left, bounds.top + (bounds.height - bounds.width) / 2, bounds.width, bounds.width);
            }
            return bounds;
        };
        var getInputValue = function (node) {
            var value = node.type === PASSWORD ? new Array(node.value.length + 1).join('\u2022') : node.value;
            return value.length === 0 ? node.placeholder || '' : value;
        };
        var CHECKBOX = 'checkbox';
        var RADIO = 'radio';
        var PASSWORD = 'password';
        var INPUT_COLOR = 0x2a2a2aff;
        var InputElementContainer = /** @class */ (function (_super) {
            __extends(InputElementContainer, _super);
            function InputElementContainer(input) {
                var _this = _super.call(this, input) || this;
                _this.type = input.type.toLowerCase();
                _this.checked = input.checked;
                _this.value = getInputValue(input);
                if (_this.type === CHECKBOX || _this.type === RADIO) {
                    _this.styles.backgroundColor = 0xdededeff;
                    _this.styles.borderTopColor = _this.styles.borderRightColor = _this.styles.borderBottomColor = _this.styles.borderLeftColor = 0xa5a5a5ff;
                    _this.styles.borderTopWidth = _this.styles.borderRightWidth = _this.styles.borderBottomWidth = _this.styles.borderLeftWidth = 1;
                    _this.styles.borderTopStyle = _this.styles.borderRightStyle = _this.styles.borderBottomStyle = _this.styles.borderLeftStyle =
                        BORDER_STYLE.SOLID;
                    _this.styles.backgroundClip = [BACKGROUND_CLIP.BORDER_BOX];
                    _this.styles.backgroundOrigin = [0 /* BORDER_BOX */];
                    _this.bounds = reformatInputBounds(_this.bounds);
                }
                switch (_this.type) {
                    case CHECKBOX:
                        _this.styles.borderTopRightRadius = _this.styles.borderTopLeftRadius = _this.styles.borderBottomRightRadius = _this.styles.borderBottomLeftRadius = CHECKBOX_BORDER_RADIUS;
                        break;
                    case RADIO:
                        _this.styles.borderTopRightRadius = _this.styles.borderTopLeftRadius = _this.styles.borderBottomRightRadius = _this.styles.borderBottomLeftRadius = RADIO_BORDER_RADIUS;
                        break;
                }
                return _this;
            }
            return InputElementContainer;
        }(ElementContainer));

        var SelectElementContainer = /** @class */ (function (_super) {
            __extends(SelectElementContainer, _super);
            function SelectElementContainer(element) {
                var _this = _super.call(this, element) || this;
                var option = element.options[element.selectedIndex || 0];
                _this.value = option ? option.text || '' : '';
                return _this;
            }
            return SelectElementContainer;
        }(ElementContainer));

        var TextareaElementContainer = /** @class */ (function (_super) {
            __extends(TextareaElementContainer, _super);
            function TextareaElementContainer(element) {
                var _this = _super.call(this, element) || this;
                _this.value = element.value;
                return _this;
            }
            return TextareaElementContainer;
        }(ElementContainer));

        var parseColor = function (value) { return color.parse(Parser.create(value).parseComponentValue()); };
        var IFrameElementContainer = /** @class */ (function (_super) {
            __extends(IFrameElementContainer, _super);
            function IFrameElementContainer(iframe) {
                var _this = _super.call(this, iframe) || this;
                _this.src = iframe.src;
                _this.width = parseInt(iframe.width, 10) || 0;
                _this.height = parseInt(iframe.height, 10) || 0;
                _this.backgroundColor = _this.styles.backgroundColor;
                try {
                    if (iframe.contentWindow &&
                        iframe.contentWindow.document &&
                        iframe.contentWindow.document.documentElement) {
                        _this.tree = parseTree(iframe.contentWindow.document.documentElement);
                        // http://www.w3.org/TR/css3-background/#special-backgrounds
                        var documentBackgroundColor = iframe.contentWindow.document.documentElement
                            ? parseColor(getComputedStyle(iframe.contentWindow.document.documentElement)
                                .backgroundColor)
                            : COLORS.TRANSPARENT;
                        var bodyBackgroundColor = iframe.contentWindow.document.body
                            ? parseColor(getComputedStyle(iframe.contentWindow.document.body).backgroundColor)
                            : COLORS.TRANSPARENT;
                        _this.backgroundColor = isTransparent(documentBackgroundColor)
                            ? isTransparent(bodyBackgroundColor)
                                ? _this.styles.backgroundColor
                                : bodyBackgroundColor
                            : documentBackgroundColor;
                    }
                }
                catch (e) { }
                return _this;
            }
            return IFrameElementContainer;
        }(ElementContainer));

        var LIST_OWNERS = ['OL', 'UL', 'MENU'];
        var parseNodeTree = function (node, parent, root) {
            for (var childNode = node.firstChild, nextNode = void 0; childNode; childNode = nextNode) {
                nextNode = childNode.nextSibling;
                if (isTextNode(childNode) && childNode.data.trim().length > 0) {
                    parent.textNodes.push(new TextContainer(childNode, parent.styles));
                }
                else if (isElementNode(childNode)) {
                    var container = createContainer(childNode);
                    if (container.styles.isVisible()) {
                        if (createsRealStackingContext(childNode, container, root)) {
                            container.flags |= 4 /* CREATES_REAL_STACKING_CONTEXT */;
                        }
                        else if (createsStackingContext(container.styles)) {
                            container.flags |= 2 /* CREATES_STACKING_CONTEXT */;
                        }
                        if (LIST_OWNERS.indexOf(childNode.tagName) !== -1) {
                            container.flags |= 8 /* IS_LIST_OWNER */;
                        }
                        parent.elements.push(container);
                        if (!isTextareaElement(childNode) && !isSVGElement(childNode) && !isSelectElement(childNode)) {
                            parseNodeTree(childNode, container, root);
                        }
                    }
                }
            }
        };
        var createContainer = function (element) {
            if (isImageElement(element)) {
                return new ImageElementContainer(element);
            }
            if (isCanvasElement(element)) {
                return new CanvasElementContainer(element);
            }
            if (isSVGElement(element)) {
                return new SVGElementContainer(element);
            }
            if (isLIElement(element)) {
                return new LIElementContainer(element);
            }
            if (isOLElement(element)) {
                return new OLElementContainer(element);
            }
            if (isInputElement(element)) {
                return new InputElementContainer(element);
            }
            if (isSelectElement(element)) {
                return new SelectElementContainer(element);
            }
            if (isTextareaElement(element)) {
                return new TextareaElementContainer(element);
            }
            if (isIFrameElement(element)) {
                return new IFrameElementContainer(element);
            }
            return new ElementContainer(element);
        };
        var parseTree = function (element) {
            var container = createContainer(element);
            container.flags |= 4 /* CREATES_REAL_STACKING_CONTEXT */;
            parseNodeTree(element, container, container);
            return container;
        };
        var createsRealStackingContext = function (node, container, root) {
            return (container.styles.isPositionedWithZIndex() ||
                container.styles.opacity < 1 ||
                container.styles.isTransformed() ||
                (isBodyElement(node) && root.styles.isTransparent()));
        };
        var createsStackingContext = function (styles) { return styles.isPositioned() || styles.isFloating(); };
        var isTextNode = function (node) { return node.nodeType === Node.TEXT_NODE; };
        var isElementNode = function (node) { return node.nodeType === Node.ELEMENT_NODE; };
        var isHTMLElementNode = function (node) {
            return isElementNode(node) && typeof node.style !== 'undefined' && !isSVGElementNode(node);
        };
        var isSVGElementNode = function (element) {
            return typeof element.className === 'object';
        };
        var isLIElement = function (node) { return node.tagName === 'LI'; };
        var isOLElement = function (node) { return node.tagName === 'OL'; };
        var isInputElement = function (node) { return node.tagName === 'INPUT'; };
        var isHTMLElement = function (node) { return node.tagName === 'HTML'; };
        var isSVGElement = function (node) { return node.tagName === 'svg'; };
        var isBodyElement = function (node) { return node.tagName === 'BODY'; };
        var isCanvasElement = function (node) { return node.tagName === 'CANVAS'; };
        var isImageElement = function (node) { return node.tagName === 'IMG'; };
        var isIFrameElement = function (node) { return node.tagName === 'IFRAME'; };
        var isStyleElement = function (node) { return node.tagName === 'STYLE'; };
        var isScriptElement = function (node) { return node.tagName === 'SCRIPT'; };
        var isTextareaElement = function (node) { return node.tagName === 'TEXTAREA'; };
        var isSelectElement = function (node) { return node.tagName === 'SELECT'; };

        var CounterState = /** @class */ (function () {
            function CounterState() {
                this.counters = {};
            }
            CounterState.prototype.getCounterValue = function (name) {
                var counter = this.counters[name];
                if (counter && counter.length) {
                    return counter[counter.length - 1];
                }
                return 1;
            };
            CounterState.prototype.getCounterValues = function (name) {
                var counter = this.counters[name];
                return counter ? counter : [];
            };
            CounterState.prototype.pop = function (counters) {
                var _this = this;
                counters.forEach(function (counter) { return _this.counters[counter].pop(); });
            };
            CounterState.prototype.parse = function (style) {
                var _this = this;
                var counterIncrement = style.counterIncrement;
                var counterReset = style.counterReset;
                var canReset = true;
                if (counterIncrement !== null) {
                    counterIncrement.forEach(function (entry) {
                        var counter = _this.counters[entry.counter];
                        if (counter && entry.increment !== 0) {
                            canReset = false;
                            counter[Math.max(0, counter.length - 1)] += entry.increment;
                        }
                    });
                }
                var counterNames = [];
                if (canReset) {
                    counterReset.forEach(function (entry) {
                        var counter = _this.counters[entry.counter];
                        counterNames.push(entry.counter);
                        if (!counter) {
                            counter = _this.counters[entry.counter] = [];
                        }
                        counter.push(entry.reset);
                    });
                }
                return counterNames;
            };
            return CounterState;
        }());
        var ROMAN_UPPER = {
            integers: [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1],
            values: ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I']
        };
        var ARMENIAN = {
            integers: [
                9000,
                8000,
                7000,
                6000,
                5000,
                4000,
                3000,
                2000,
                1000,
                900,
                800,
                700,
                600,
                500,
                400,
                300,
                200,
                100,
                90,
                80,
                70,
                60,
                50,
                40,
                30,
                20,
                10,
                9,
                8,
                7,
                6,
                5,
                4,
                3,
                2,
                1
            ],
            values: [
                'Ք',
                'Փ',
                'Ւ',
                'Ց',
                'Ր',
                'Տ',
                'Վ',
                'Ս',
                'Ռ',
                'Ջ',
                'Պ',
                'Չ',
                'Ո',
                'Շ',
                'Ն',
                'Յ',
                'Մ',
                'Ճ',
                'Ղ',
                'Ձ',
                'Հ',
                'Կ',
                'Ծ',
                'Խ',
                'Լ',
                'Ի',
                'Ժ',
                'Թ',
                'Ը',
                'Է',
                'Զ',
                'Ե',
                'Դ',
                'Գ',
                'Բ',
                'Ա'
            ]
        };
        var HEBREW = {
            integers: [
                10000,
                9000,
                8000,
                7000,
                6000,
                5000,
                4000,
                3000,
                2000,
                1000,
                400,
                300,
                200,
                100,
                90,
                80,
                70,
                60,
                50,
                40,
                30,
                20,
                19,
                18,
                17,
                16,
                15,
                10,
                9,
                8,
                7,
                6,
                5,
                4,
                3,
                2,
                1
            ],
            values: [
                'י׳',
                'ט׳',
                'ח׳',
                'ז׳',
                'ו׳',
                'ה׳',
                'ד׳',
                'ג׳',
                'ב׳',
                'א׳',
                'ת',
                'ש',
                'ר',
                'ק',
                'צ',
                'פ',
                'ע',
                'ס',
                'נ',
                'מ',
                'ל',
                'כ',
                'יט',
                'יח',
                'יז',
                'טז',
                'טו',
                'י',
                'ט',
                'ח',
                'ז',
                'ו',
                'ה',
                'ד',
                'ג',
                'ב',
                'א'
            ]
        };
        var GEORGIAN = {
            integers: [
                10000,
                9000,
                8000,
                7000,
                6000,
                5000,
                4000,
                3000,
                2000,
                1000,
                900,
                800,
                700,
                600,
                500,
                400,
                300,
                200,
                100,
                90,
                80,
                70,
                60,
                50,
                40,
                30,
                20,
                10,
                9,
                8,
                7,
                6,
                5,
                4,
                3,
                2,
                1
            ],
            values: [
                'ჵ',
                'ჰ',
                'ჯ',
                'ჴ',
                'ხ',
                'ჭ',
                'წ',
                'ძ',
                'ც',
                'ჩ',
                'შ',
                'ყ',
                'ღ',
                'ქ',
                'ფ',
                'ჳ',
                'ტ',
                'ს',
                'რ',
                'ჟ',
                'პ',
                'ო',
                'ჲ',
                'ნ',
                'მ',
                'ლ',
                'კ',
                'ი',
                'თ',
                'ჱ',
                'ზ',
                'ვ',
                'ე',
                'დ',
                'გ',
                'ბ',
                'ა'
            ]
        };
        var createAdditiveCounter = function (value, min, max, symbols, fallback, suffix) {
            if (value < min || value > max) {
                return createCounterText(value, fallback, suffix.length > 0);
            }
            return (symbols.integers.reduce(function (string, integer, index) {
                while (value >= integer) {
                    value -= integer;
                    string += symbols.values[index];
                }
                return string;
            }, '') + suffix);
        };
        var createCounterStyleWithSymbolResolver = function (value, codePointRangeLength, isNumeric, resolver) {
            var string = '';
            do {
                if (!isNumeric) {
                    value--;
                }
                string = resolver(value) + string;
                value /= codePointRangeLength;
            } while (value * codePointRangeLength >= codePointRangeLength);
            return string;
        };
        var createCounterStyleFromRange = function (value, codePointRangeStart, codePointRangeEnd, isNumeric, suffix) {
            var codePointRangeLength = codePointRangeEnd - codePointRangeStart + 1;
            return ((value < 0 ? '-' : '') +
                (createCounterStyleWithSymbolResolver(Math.abs(value), codePointRangeLength, isNumeric, function (codePoint) {
                    return fromCodePoint(Math.floor(codePoint % codePointRangeLength) + codePointRangeStart);
                }) +
                    suffix));
        };
        var createCounterStyleFromSymbols = function (value, symbols, suffix) {
            if (suffix === void 0) { suffix = '. '; }
            var codePointRangeLength = symbols.length;
            return (createCounterStyleWithSymbolResolver(Math.abs(value), codePointRangeLength, false, function (codePoint) { return symbols[Math.floor(codePoint % codePointRangeLength)]; }) + suffix);
        };
        var CJK_ZEROS = 1 << 0;
        var CJK_TEN_COEFFICIENTS = 1 << 1;
        var CJK_TEN_HIGH_COEFFICIENTS = 1 << 2;
        var CJK_HUNDRED_COEFFICIENTS = 1 << 3;
        var createCJKCounter = function (value, numbers, multipliers, negativeSign, suffix, flags) {
            if (value < -9999 || value > 9999) {
                return createCounterText(value, LIST_STYLE_TYPE.CJK_DECIMAL, suffix.length > 0);
            }
            var tmp = Math.abs(value);
            var string = suffix;
            if (tmp === 0) {
                return numbers[0] + string;
            }
            for (var digit = 0; tmp > 0 && digit <= 4; digit++) {
                var coefficient = tmp % 10;
                if (coefficient === 0 && contains(flags, CJK_ZEROS) && string !== '') {
                    string = numbers[coefficient] + string;
                }
                else if (coefficient > 1 ||
                    (coefficient === 1 && digit === 0) ||
                    (coefficient === 1 && digit === 1 && contains(flags, CJK_TEN_COEFFICIENTS)) ||
                    (coefficient === 1 && digit === 1 && contains(flags, CJK_TEN_HIGH_COEFFICIENTS) && value > 100) ||
                    (coefficient === 1 && digit > 1 && contains(flags, CJK_HUNDRED_COEFFICIENTS))) {
                    string = numbers[coefficient] + (digit > 0 ? multipliers[digit - 1] : '') + string;
                }
                else if (coefficient === 1 && digit > 0) {
                    string = multipliers[digit - 1] + string;
                }
                tmp = Math.floor(tmp / 10);
            }
            return (value < 0 ? negativeSign : '') + string;
        };
        var CHINESE_INFORMAL_MULTIPLIERS = '十百千萬';
        var CHINESE_FORMAL_MULTIPLIERS = '拾佰仟萬';
        var JAPANESE_NEGATIVE = 'マイナス';
        var KOREAN_NEGATIVE = '마이너스';
        var createCounterText = function (value, type, appendSuffix) {
            var defaultSuffix = appendSuffix ? '. ' : '';
            var cjkSuffix = appendSuffix ? '、' : '';
            var koreanSuffix = appendSuffix ? ', ' : '';
            var spaceSuffix = appendSuffix ? ' ' : '';
            switch (type) {
                case LIST_STYLE_TYPE.DISC:
                    return '•' + spaceSuffix;
                case LIST_STYLE_TYPE.CIRCLE:
                    return '◦' + spaceSuffix;
                case LIST_STYLE_TYPE.SQUARE:
                    return '◾' + spaceSuffix;
                case LIST_STYLE_TYPE.DECIMAL_LEADING_ZERO:
                    var string = createCounterStyleFromRange(value, 48, 57, true, defaultSuffix);
                    return string.length < 4 ? "0" + string : string;
                case LIST_STYLE_TYPE.CJK_DECIMAL:
                    return createCounterStyleFromSymbols(value, '〇一二三四五六七八九', cjkSuffix);
                case LIST_STYLE_TYPE.LOWER_ROMAN:
                    return createAdditiveCounter(value, 1, 3999, ROMAN_UPPER, LIST_STYLE_TYPE.DECIMAL, defaultSuffix).toLowerCase();
                case LIST_STYLE_TYPE.UPPER_ROMAN:
                    return createAdditiveCounter(value, 1, 3999, ROMAN_UPPER, LIST_STYLE_TYPE.DECIMAL, defaultSuffix);
                case LIST_STYLE_TYPE.LOWER_GREEK:
                    return createCounterStyleFromRange(value, 945, 969, false, defaultSuffix);
                case LIST_STYLE_TYPE.LOWER_ALPHA:
                    return createCounterStyleFromRange(value, 97, 122, false, defaultSuffix);
                case LIST_STYLE_TYPE.UPPER_ALPHA:
                    return createCounterStyleFromRange(value, 65, 90, false, defaultSuffix);
                case LIST_STYLE_TYPE.ARABIC_INDIC:
                    return createCounterStyleFromRange(value, 1632, 1641, true, defaultSuffix);
                case LIST_STYLE_TYPE.ARMENIAN:
                case LIST_STYLE_TYPE.UPPER_ARMENIAN:
                    return createAdditiveCounter(value, 1, 9999, ARMENIAN, LIST_STYLE_TYPE.DECIMAL, defaultSuffix);
                case LIST_STYLE_TYPE.LOWER_ARMENIAN:
                    return createAdditiveCounter(value, 1, 9999, ARMENIAN, LIST_STYLE_TYPE.DECIMAL, defaultSuffix).toLowerCase();
                case LIST_STYLE_TYPE.BENGALI:
                    return createCounterStyleFromRange(value, 2534, 2543, true, defaultSuffix);
                case LIST_STYLE_TYPE.CAMBODIAN:
                case LIST_STYLE_TYPE.KHMER:
                    return createCounterStyleFromRange(value, 6112, 6121, true, defaultSuffix);
                case LIST_STYLE_TYPE.CJK_EARTHLY_BRANCH:
                    return createCounterStyleFromSymbols(value, '子丑寅卯辰巳午未申酉戌亥', cjkSuffix);
                case LIST_STYLE_TYPE.CJK_HEAVENLY_STEM:
                    return createCounterStyleFromSymbols(value, '甲乙丙丁戊己庚辛壬癸', cjkSuffix);
                case LIST_STYLE_TYPE.CJK_IDEOGRAPHIC:
                case LIST_STYLE_TYPE.TRAD_CHINESE_INFORMAL:
                    return createCJKCounter(value, '零一二三四五六七八九', CHINESE_INFORMAL_MULTIPLIERS, '負', cjkSuffix, CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS | CJK_HUNDRED_COEFFICIENTS);
                case LIST_STYLE_TYPE.TRAD_CHINESE_FORMAL:
                    return createCJKCounter(value, '零壹貳參肆伍陸柒捌玖', CHINESE_FORMAL_MULTIPLIERS, '負', cjkSuffix, CJK_ZEROS | CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS | CJK_HUNDRED_COEFFICIENTS);
                case LIST_STYLE_TYPE.SIMP_CHINESE_INFORMAL:
                    return createCJKCounter(value, '零一二三四五六七八九', CHINESE_INFORMAL_MULTIPLIERS, '负', cjkSuffix, CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS | CJK_HUNDRED_COEFFICIENTS);
                case LIST_STYLE_TYPE.SIMP_CHINESE_FORMAL:
                    return createCJKCounter(value, '零壹贰叁肆伍陆柒捌玖', CHINESE_FORMAL_MULTIPLIERS, '负', cjkSuffix, CJK_ZEROS | CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS | CJK_HUNDRED_COEFFICIENTS);
                case LIST_STYLE_TYPE.JAPANESE_INFORMAL:
                    return createCJKCounter(value, '〇一二三四五六七八九', '十百千万', JAPANESE_NEGATIVE, cjkSuffix, 0);
                case LIST_STYLE_TYPE.JAPANESE_FORMAL:
                    return createCJKCounter(value, '零壱弐参四伍六七八九', '拾百千万', JAPANESE_NEGATIVE, cjkSuffix, CJK_ZEROS | CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS);
                case LIST_STYLE_TYPE.KOREAN_HANGUL_FORMAL:
                    return createCJKCounter(value, '영일이삼사오육칠팔구', '십백천만', KOREAN_NEGATIVE, koreanSuffix, CJK_ZEROS | CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS);
                case LIST_STYLE_TYPE.KOREAN_HANJA_INFORMAL:
                    return createCJKCounter(value, '零一二三四五六七八九', '十百千萬', KOREAN_NEGATIVE, koreanSuffix, 0);
                case LIST_STYLE_TYPE.KOREAN_HANJA_FORMAL:
                    return createCJKCounter(value, '零壹貳參四五六七八九', '拾百千', KOREAN_NEGATIVE, koreanSuffix, CJK_ZEROS | CJK_TEN_COEFFICIENTS | CJK_TEN_HIGH_COEFFICIENTS);
                case LIST_STYLE_TYPE.DEVANAGARI:
                    return createCounterStyleFromRange(value, 0x966, 0x96f, true, defaultSuffix);
                case LIST_STYLE_TYPE.GEORGIAN:
                    return createAdditiveCounter(value, 1, 19999, GEORGIAN, LIST_STYLE_TYPE.DECIMAL, defaultSuffix);
                case LIST_STYLE_TYPE.GUJARATI:
                    return createCounterStyleFromRange(value, 0xae6, 0xaef, true, defaultSuffix);
                case LIST_STYLE_TYPE.GURMUKHI:
                    return createCounterStyleFromRange(value, 0xa66, 0xa6f, true, defaultSuffix);
                case LIST_STYLE_TYPE.HEBREW:
                    return createAdditiveCounter(value, 1, 10999, HEBREW, LIST_STYLE_TYPE.DECIMAL, defaultSuffix);
                case LIST_STYLE_TYPE.HIRAGANA:
                    return createCounterStyleFromSymbols(value, 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわゐゑをん');
                case LIST_STYLE_TYPE.HIRAGANA_IROHA:
                    return createCounterStyleFromSymbols(value, 'いろはにほへとちりぬるをわかよたれそつねならむうゐのおくやまけふこえてあさきゆめみしゑひもせす');
                case LIST_STYLE_TYPE.KANNADA:
                    return createCounterStyleFromRange(value, 0xce6, 0xcef, true, defaultSuffix);
                case LIST_STYLE_TYPE.KATAKANA:
                    return createCounterStyleFromSymbols(value, 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヰヱヲン', cjkSuffix);
                case LIST_STYLE_TYPE.KATAKANA_IROHA:
                    return createCounterStyleFromSymbols(value, 'イロハニホヘトチリヌルヲワカヨタレソツネナラムウヰノオクヤマケフコエテアサキユメミシヱヒモセス', cjkSuffix);
                case LIST_STYLE_TYPE.LAO:
                    return createCounterStyleFromRange(value, 0xed0, 0xed9, true, defaultSuffix);
                case LIST_STYLE_TYPE.MONGOLIAN:
                    return createCounterStyleFromRange(value, 0x1810, 0x1819, true, defaultSuffix);
                case LIST_STYLE_TYPE.MYANMAR:
                    return createCounterStyleFromRange(value, 0x1040, 0x1049, true, defaultSuffix);
                case LIST_STYLE_TYPE.ORIYA:
                    return createCounterStyleFromRange(value, 0xb66, 0xb6f, true, defaultSuffix);
                case LIST_STYLE_TYPE.PERSIAN:
                    return createCounterStyleFromRange(value, 0x6f0, 0x6f9, true, defaultSuffix);
                case LIST_STYLE_TYPE.TAMIL:
                    return createCounterStyleFromRange(value, 0xbe6, 0xbef, true, defaultSuffix);
                case LIST_STYLE_TYPE.TELUGU:
                    return createCounterStyleFromRange(value, 0xc66, 0xc6f, true, defaultSuffix);
                case LIST_STYLE_TYPE.THAI:
                    return createCounterStyleFromRange(value, 0xe50, 0xe59, true, defaultSuffix);
                case LIST_STYLE_TYPE.TIBETAN:
                    return createCounterStyleFromRange(value, 0xf20, 0xf29, true, defaultSuffix);
                case LIST_STYLE_TYPE.DECIMAL:
                default:
                    return createCounterStyleFromRange(value, 48, 57, true, defaultSuffix);
            }
        };

        var IGNORE_ATTRIBUTE = 'data-html2canvas-ignore';
        var DocumentCloner = /** @class */ (function () {
            function DocumentCloner(element, options) {
                this.options = options;
                this.scrolledElements = [];
                this.referenceElement = element;
                this.counters = new CounterState();
                this.quoteDepth = 0;
                if (!element.ownerDocument) {
                    throw new Error('Cloned element does not have an owner document');
                }
                this.documentElement = this.cloneNode(element.ownerDocument.documentElement);
            }
            DocumentCloner.prototype.toIFrame = function (ownerDocument, windowSize) {
                var _this = this;
                var iframe = createIFrameContainer(ownerDocument, windowSize);
                if (!iframe.contentWindow) {
                    return Promise.reject("Unable to find iframe window");
                }
                var scrollX = ownerDocument.defaultView.pageXOffset;
                var scrollY = ownerDocument.defaultView.pageYOffset;
                var cloneWindow = iframe.contentWindow;
                var documentClone = cloneWindow.document;
                /* Chrome doesn't detect relative background-images assigned in inline <style> sheets when fetched through getComputedStyle
                 if window url is about:blank, we can assign the url to current by writing onto the document
                 */
                var iframeLoad = iframeLoader(iframe).then(function () { return __awaiter(_this, void 0, void 0, function () {
                    var onclone;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                this.scrolledElements.forEach(restoreNodeScroll);
                                if (cloneWindow) {
                                    cloneWindow.scrollTo(windowSize.left, windowSize.top);
                                    if (/(iPad|iPhone|iPod)/g.test(navigator.userAgent) &&
                                        (cloneWindow.scrollY !== windowSize.top || cloneWindow.scrollX !== windowSize.left)) {
                                        documentClone.documentElement.style.top = -windowSize.top + 'px';
                                        documentClone.documentElement.style.left = -windowSize.left + 'px';
                                        documentClone.documentElement.style.position = 'absolute';
                                    }
                                }
                                onclone = this.options.onclone;
                                if (typeof this.clonedReferenceElement === 'undefined') {
                                    return [2 /*return*/, Promise.reject("Error finding the " + this.referenceElement.nodeName + " in the cloned document")];
                                }
                                if (!(documentClone.fonts && documentClone.fonts.ready)) return [3 /*break*/, 2];
                                return [4 /*yield*/, documentClone.fonts.ready];
                            case 1:
                                _a.sent();
                                _a.label = 2;
                            case 2:
                                if (typeof onclone === 'function') {
                                    return [2 /*return*/, Promise.resolve()
                                            .then(function () { return onclone(documentClone); })
                                            .then(function () { return iframe; })];
                                }
                                return [2 /*return*/, iframe];
                        }
                    });
                }); });
                documentClone.open();
                documentClone.write(serializeDoctype(document.doctype) + "<html></html>");
                // Chrome scrolls the parent document for some reason after the write to the cloned window???
                restoreOwnerScroll(this.referenceElement.ownerDocument, scrollX, scrollY);
                documentClone.replaceChild(documentClone.adoptNode(this.documentElement), documentClone.documentElement);
                documentClone.close();
                return iframeLoad;
            };
            DocumentCloner.prototype.createElementClone = function (node) {
                if (isCanvasElement(node)) {
                    return this.createCanvasClone(node);
                }
                /*
                if (isIFrameElement(node)) {
                    return this.createIFrameClone(node);
                }
        */
                if (isStyleElement(node)) {
                    return this.createStyleClone(node);
                }
                var clone = node.cloneNode(false);
                // @ts-ignore
                if (isImageElement(clone) && clone.loading === 'lazy') {
                    // @ts-ignore
                    clone.loading = 'eager';
                }
                return clone;
            };
            DocumentCloner.prototype.createStyleClone = function (node) {
                try {
                    var sheet = node.sheet;
                    if (sheet && sheet.cssRules) {
                        var css = [].slice.call(sheet.cssRules, 0).reduce(function (css, rule) {
                            if (rule && typeof rule.cssText === 'string') {
                                return css + rule.cssText;
                            }
                            return css;
                        }, '');
                        var style = node.cloneNode(false);
                        style.textContent = css;
                        return style;
                    }
                }
                catch (e) {
                    // accessing node.sheet.cssRules throws a DOMException
                    Logger.getInstance(this.options.id).error('Unable to access cssRules property', e);
                    if (e.name !== 'SecurityError') {
                        throw e;
                    }
                }
                return node.cloneNode(false);
            };
            DocumentCloner.prototype.createCanvasClone = function (canvas) {
                if (this.options.inlineImages && canvas.ownerDocument) {
                    var img = canvas.ownerDocument.createElement('img');
                    try {
                        img.src = canvas.toDataURL();
                        return img;
                    }
                    catch (e) {
                        Logger.getInstance(this.options.id).info("Unable to clone canvas contents, canvas is tainted");
                    }
                }
                var clonedCanvas = canvas.cloneNode(false);
                try {
                    clonedCanvas.width = canvas.width;
                    clonedCanvas.height = canvas.height;
                    var ctx = canvas.getContext('2d');
                    var clonedCtx = clonedCanvas.getContext('2d');
                    if (clonedCtx) {
                        if (ctx) {
                            clonedCtx.putImageData(ctx.getImageData(0, 0, canvas.width, canvas.height), 0, 0);
                        }
                        else {
                            clonedCtx.drawImage(canvas, 0, 0);
                        }
                    }
                    return clonedCanvas;
                }
                catch (e) { }
                return clonedCanvas;
            };
            /*
            createIFrameClone(iframe: HTMLIFrameElement) {
                const tempIframe = <HTMLIFrameElement>iframe.cloneNode(false);
                const iframeKey = generateIframeKey();
                tempIframe.setAttribute('data-html2canvas-internal-iframe-key', iframeKey);

                const {width, height} = parseBounds(iframe);

                this.resourceLoader.cache[iframeKey] = getIframeDocumentElement(iframe, this.options)
                    .then(documentElement => {
                        return this.renderer(
                            documentElement,
                            {
                                allowTaint: this.options.allowTaint,
                                backgroundColor: '#ffffff',
                                canvas: null,
                                imageTimeout: this.options.imageTimeout,
                                logging: this.options.logging,
                                proxy: this.options.proxy,
                                removeContainer: this.options.removeContainer,
                                scale: this.options.scale,
                                foreignObjectRendering: this.options.foreignObjectRendering,
                                useCORS: this.options.useCORS,
                                target: new CanvasRenderer(),
                                width,
                                height,
                                x: 0,
                                y: 0,
                                windowWidth: documentElement.ownerDocument.defaultView.innerWidth,
                                windowHeight: documentElement.ownerDocument.defaultView.innerHeight,
                                scrollX: documentElement.ownerDocument.defaultView.pageXOffset,
                                scrollY: documentElement.ownerDocument.defaultView.pageYOffset
                            },
                        );
                    })
                    .then(
                        (canvas: HTMLCanvasElement) =>
                            new Promise((resolve, reject) => {
                                const iframeCanvas = document.createElement('img');
                                iframeCanvas.onload = () => resolve(canvas);
                                iframeCanvas.onerror = (event) => {
                                    // Empty iframes may result in empty "data:," URLs, which are invalid from the <img>'s point of view
                                    // and instead of `onload` cause `onerror` and unhandled rejection warnings
                                    // https://github.com/niklasvh/html2canvas/issues/1502
                                    iframeCanvas.src == 'data:,' ? resolve(canvas) : reject(event);
                                };
                                iframeCanvas.src = canvas.toDataURL();
                                if (tempIframe.parentNode && iframe.ownerDocument && iframe.ownerDocument.defaultView) {
                                    tempIframe.parentNode.replaceChild(
                                        copyCSSStyles(
                                            iframe.ownerDocument.defaultView.getComputedStyle(iframe),
                                            iframeCanvas
                                        ),
                                        tempIframe
                                    );
                                }
                            })
                    );
                return tempIframe;
            }
        */
            DocumentCloner.prototype.cloneNode = function (node) {
                if (isTextNode(node)) {
                    return document.createTextNode(node.data);
                }
                if (!node.ownerDocument) {
                    return node.cloneNode(false);
                }
                var window = node.ownerDocument.defaultView;
                if (window && isElementNode(node) && (isHTMLElementNode(node) || isSVGElementNode(node))) {
                    var clone = this.createElementClone(node);
                    var style = window.getComputedStyle(node);
                    var styleBefore = window.getComputedStyle(node, ':before');
                    var styleAfter = window.getComputedStyle(node, ':after');
                    if (this.referenceElement === node && isHTMLElementNode(clone)) {
                        this.clonedReferenceElement = clone;
                    }
                    if (isBodyElement(clone)) {
                        createPseudoHideStyles(clone);
                    }
                    var counters = this.counters.parse(new CSSParsedCounterDeclaration(style));
                    var before = this.resolvePseudoContent(node, clone, styleBefore, PseudoElementType.BEFORE);
                    for (var child = node.firstChild; child; child = child.nextSibling) {
                        if (!isElementNode(child) ||
                            (!isScriptElement(child) &&
                                !child.hasAttribute(IGNORE_ATTRIBUTE) &&
                                (typeof this.options.ignoreElements !== 'function' || !this.options.ignoreElements(child)))) {
                            if (!this.options.copyStyles || !isElementNode(child) || !isStyleElement(child)) {
                                clone.appendChild(this.cloneNode(child));
                            }
                        }
                    }
                    if (before) {
                        clone.insertBefore(before, clone.firstChild);
                    }
                    var after = this.resolvePseudoContent(node, clone, styleAfter, PseudoElementType.AFTER);
                    if (after) {
                        clone.appendChild(after);
                    }
                    this.counters.pop(counters);
                    if (style && (this.options.copyStyles || isSVGElementNode(node)) && !isIFrameElement(node)) {
                        copyCSSStyles(style, clone);
                    }
                    //this.inlineAllImages(clone);
                    if (node.scrollTop !== 0 || node.scrollLeft !== 0) {
                        this.scrolledElements.push([clone, node.scrollLeft, node.scrollTop]);
                    }
                    if ((isTextareaElement(node) || isSelectElement(node)) &&
                        (isTextareaElement(clone) || isSelectElement(clone))) {
                        clone.value = node.value;
                    }
                    return clone;
                }
                return node.cloneNode(false);
            };
            DocumentCloner.prototype.resolvePseudoContent = function (node, clone, style, pseudoElt) {
                var _this = this;
                if (!style) {
                    return;
                }
                var value = style.content;
                var document = clone.ownerDocument;
                if (!document || !value || value === 'none' || value === '-moz-alt-content' || style.display === 'none') {
                    return;
                }
                this.counters.parse(new CSSParsedCounterDeclaration(style));
                var declaration = new CSSParsedPseudoDeclaration(style);
                var anonymousReplacedElement = document.createElement('html2canvaspseudoelement');
                copyCSSStyles(style, anonymousReplacedElement);
                declaration.content.forEach(function (token) {
                    if (token.type === TokenType.STRING_TOKEN) {
                        anonymousReplacedElement.appendChild(document.createTextNode(token.value));
                    }
                    else if (token.type === TokenType.URL_TOKEN) {
                        var img = document.createElement('img');
                        img.src = token.value;
                        img.style.opacity = '1';
                        anonymousReplacedElement.appendChild(img);
                    }
                    else if (token.type === TokenType.FUNCTION) {
                        if (token.name === 'attr') {
                            var attr = token.values.filter(isIdentToken);
                            if (attr.length) {
                                anonymousReplacedElement.appendChild(document.createTextNode(node.getAttribute(attr[0].value) || ''));
                            }
                        }
                        else if (token.name === 'counter') {
                            var _a = token.values.filter(nonFunctionArgSeparator), counter = _a[0], counterStyle = _a[1];
                            if (counter && isIdentToken(counter)) {
                                var counterState = _this.counters.getCounterValue(counter.value);
                                var counterType = counterStyle && isIdentToken(counterStyle)
                                    ? listStyleType.parse(counterStyle.value)
                                    : LIST_STYLE_TYPE.DECIMAL;
                                anonymousReplacedElement.appendChild(document.createTextNode(createCounterText(counterState, counterType, false)));
                            }
                        }
                        else if (token.name === 'counters') {
                            var _b = token.values.filter(nonFunctionArgSeparator), counter = _b[0], delim = _b[1], counterStyle = _b[2];
                            if (counter && isIdentToken(counter)) {
                                var counterStates = _this.counters.getCounterValues(counter.value);
                                var counterType_1 = counterStyle && isIdentToken(counterStyle)
                                    ? listStyleType.parse(counterStyle.value)
                                    : LIST_STYLE_TYPE.DECIMAL;
                                var separator = delim && delim.type === TokenType.STRING_TOKEN ? delim.value : '';
                                var text = counterStates
                                    .map(function (value) { return createCounterText(value, counterType_1, false); })
                                    .join(separator);
                                anonymousReplacedElement.appendChild(document.createTextNode(text));
                            }
                        }
                    }
                    else if (token.type === TokenType.IDENT_TOKEN) {
                        switch (token.value) {
                            case 'open-quote':
                                anonymousReplacedElement.appendChild(document.createTextNode(getQuote(declaration.quotes, _this.quoteDepth++, true)));
                                break;
                            case 'close-quote':
                                anonymousReplacedElement.appendChild(document.createTextNode(getQuote(declaration.quotes, --_this.quoteDepth, false)));
                                break;
                            default:
                                // safari doesn't parse string tokens correctly because of lack of quotes
                                anonymousReplacedElement.appendChild(document.createTextNode(token.value));
                        }
                    }
                });
                anonymousReplacedElement.className = PSEUDO_HIDE_ELEMENT_CLASS_BEFORE + " " + PSEUDO_HIDE_ELEMENT_CLASS_AFTER;
                var newClassName = pseudoElt === PseudoElementType.BEFORE
                    ? " " + PSEUDO_HIDE_ELEMENT_CLASS_BEFORE
                    : " " + PSEUDO_HIDE_ELEMENT_CLASS_AFTER;
                if (isSVGElementNode(clone)) {
                    clone.className.baseValue += newClassName;
                }
                else {
                    clone.className += newClassName;
                }
                return anonymousReplacedElement;
            };
            DocumentCloner.destroy = function (container) {
                if (container.parentNode) {
                    container.parentNode.removeChild(container);
                    return true;
                }
                return false;
            };
            return DocumentCloner;
        }());
        var PseudoElementType;
        (function (PseudoElementType) {
            PseudoElementType[PseudoElementType["BEFORE"] = 0] = "BEFORE";
            PseudoElementType[PseudoElementType["AFTER"] = 1] = "AFTER";
        })(PseudoElementType || (PseudoElementType = {}));
        var createIFrameContainer = function (ownerDocument, bounds) {
            var cloneIframeContainer = ownerDocument.createElement('iframe');
            cloneIframeContainer.className = 'html2canvas-container';
            cloneIframeContainer.style.visibility = 'hidden';
            cloneIframeContainer.style.position = 'fixed';
            cloneIframeContainer.style.left = '-10000px';
            cloneIframeContainer.style.top = '0px';
            cloneIframeContainer.style.border = '0';
            cloneIframeContainer.width = bounds.width.toString();
            cloneIframeContainer.height = bounds.height.toString();
            cloneIframeContainer.scrolling = 'no'; // ios won't scroll without it
            cloneIframeContainer.setAttribute(IGNORE_ATTRIBUTE, 'true');
            ownerDocument.body.appendChild(cloneIframeContainer);
            return cloneIframeContainer;
        };
        var iframeLoader = function (iframe) {
            return new Promise(function (resolve, reject) {
                var cloneWindow = iframe.contentWindow;
                if (!cloneWindow) {
                    return reject("No window assigned for iframe");
                }
                var documentClone = cloneWindow.document;
                cloneWindow.onload = iframe.onload = documentClone.onreadystatechange = function () {
                    cloneWindow.onload = iframe.onload = documentClone.onreadystatechange = null;
                    var interval = setInterval(function () {
                        if (documentClone.body.childNodes.length > 0 && documentClone.readyState === 'complete') {
                            clearInterval(interval);
                            resolve(iframe);
                        }
                    }, 50);
                };
            });
        };
        var copyCSSStyles = function (style, target) {
            // Edge does not provide value for cssText
            for (var i = style.length - 1; i >= 0; i--) {
                var property = style.item(i);
                // Safari shows pseudoelements if content is set
                if (property !== 'content') {
                    target.style.setProperty(property, style.getPropertyValue(property));
                }
            }
            return target;
        };
        var serializeDoctype = function (doctype) {
            var str = '';
            if (doctype) {
                str += '<!DOCTYPE ';
                if (doctype.name) {
                    str += doctype.name;
                }
                if (doctype.internalSubset) {
                    str += doctype.internalSubset;
                }
                if (doctype.publicId) {
                    str += "\"" + doctype.publicId + "\"";
                }
                if (doctype.systemId) {
                    str += "\"" + doctype.systemId + "\"";
                }
                str += '>';
            }
            return str;
        };
        var restoreOwnerScroll = function (ownerDocument, x, y) {
            if (ownerDocument &&
                ownerDocument.defaultView &&
                (x !== ownerDocument.defaultView.pageXOffset || y !== ownerDocument.defaultView.pageYOffset)) {
                ownerDocument.defaultView.scrollTo(x, y);
            }
        };
        var restoreNodeScroll = function (_a) {
            var element = _a[0], x = _a[1], y = _a[2];
            element.scrollLeft = x;
            element.scrollTop = y;
        };
        var PSEUDO_BEFORE = ':before';
        var PSEUDO_AFTER = ':after';
        var PSEUDO_HIDE_ELEMENT_CLASS_BEFORE = '___html2canvas___pseudoelement_before';
        var PSEUDO_HIDE_ELEMENT_CLASS_AFTER = '___html2canvas___pseudoelement_after';
        var PSEUDO_HIDE_ELEMENT_STYLE = "{\n    content: \"\" !important;\n    display: none !important;\n}";
        var createPseudoHideStyles = function (body) {
            createStyles(body, "." + PSEUDO_HIDE_ELEMENT_CLASS_BEFORE + PSEUDO_BEFORE + PSEUDO_HIDE_ELEMENT_STYLE + "\n         ." + PSEUDO_HIDE_ELEMENT_CLASS_AFTER + PSEUDO_AFTER + PSEUDO_HIDE_ELEMENT_STYLE);
        };
        var createStyles = function (body, styles) {
            var document = body.ownerDocument;
            if (document) {
                var style = document.createElement('style');
                style.textContent = styles;
                body.appendChild(style);
            }
        };

        var PathType;
        (function (PathType) {
            PathType[PathType["VECTOR"] = 0] = "VECTOR";
            PathType[PathType["BEZIER_CURVE"] = 1] = "BEZIER_CURVE";
        })(PathType || (PathType = {}));
        var equalPath = function (a, b) {
            if (a.length === b.length) {
                return a.some(function (v, i) { return v === b[i]; });
            }
            return false;
        };
        var transformPath = function (path, deltaX, deltaY, deltaW, deltaH) {
            return path.map(function (point, index) {
                switch (index) {
                    case 0:
                        return point.add(deltaX, deltaY);
                    case 1:
                        return point.add(deltaX + deltaW, deltaY);
                    case 2:
                        return point.add(deltaX + deltaW, deltaY + deltaH);
                    case 3:
                        return point.add(deltaX, deltaY + deltaH);
                }
                return point;
            });
        };

        var Vector = /** @class */ (function () {
            function Vector(x, y) {
                this.type = PathType.VECTOR;
                this.x = x;
                this.y = y;
            }
            Vector.prototype.add = function (deltaX, deltaY) {
                return new Vector(this.x + deltaX, this.y + deltaY);
            };
            return Vector;
        }());

        var lerp = function (a, b, t) {
            return new Vector(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
        };
        var BezierCurve = /** @class */ (function () {
            function BezierCurve(start, startControl, endControl, end) {
                this.type = PathType.BEZIER_CURVE;
                this.start = start;
                this.startControl = startControl;
                this.endControl = endControl;
                this.end = end;
            }
            BezierCurve.prototype.subdivide = function (t, firstHalf) {
                var ab = lerp(this.start, this.startControl, t);
                var bc = lerp(this.startControl, this.endControl, t);
                var cd = lerp(this.endControl, this.end, t);
                var abbc = lerp(ab, bc, t);
                var bccd = lerp(bc, cd, t);
                var dest = lerp(abbc, bccd, t);
                return firstHalf ? new BezierCurve(this.start, ab, abbc, dest) : new BezierCurve(dest, bccd, cd, this.end);
            };
            BezierCurve.prototype.add = function (deltaX, deltaY) {
                return new BezierCurve(this.start.add(deltaX, deltaY), this.startControl.add(deltaX, deltaY), this.endControl.add(deltaX, deltaY), this.end.add(deltaX, deltaY));
            };
            BezierCurve.prototype.reverse = function () {
                return new BezierCurve(this.end, this.endControl, this.startControl, this.start);
            };
            return BezierCurve;
        }());
        var isBezierCurve = function (path) { return path.type === PathType.BEZIER_CURVE; };

        var BoundCurves = /** @class */ (function () {
            function BoundCurves(element) {
                var styles = element.styles;
                var bounds = element.bounds;
                var _a = getAbsoluteValueForTuple(styles.borderTopLeftRadius, bounds.width, bounds.height), tlh = _a[0], tlv = _a[1];
                var _b = getAbsoluteValueForTuple(styles.borderTopRightRadius, bounds.width, bounds.height), trh = _b[0], trv = _b[1];
                var _c = getAbsoluteValueForTuple(styles.borderBottomRightRadius, bounds.width, bounds.height), brh = _c[0], brv = _c[1];
                var _d = getAbsoluteValueForTuple(styles.borderBottomLeftRadius, bounds.width, bounds.height), blh = _d[0], blv = _d[1];
                var factors = [];
                factors.push((tlh + trh) / bounds.width);
                factors.push((blh + brh) / bounds.width);
                factors.push((tlv + blv) / bounds.height);
                factors.push((trv + brv) / bounds.height);
                var maxFactor = Math.max.apply(Math, factors);
                if (maxFactor > 1) {
                    tlh /= maxFactor;
                    tlv /= maxFactor;
                    trh /= maxFactor;
                    trv /= maxFactor;
                    brh /= maxFactor;
                    brv /= maxFactor;
                    blh /= maxFactor;
                    blv /= maxFactor;
                }
                var topWidth = bounds.width - trh;
                var rightHeight = bounds.height - brv;
                var bottomWidth = bounds.width - brh;
                var leftHeight = bounds.height - blv;
                var borderTopWidth = styles.borderTopWidth;
                var borderRightWidth = styles.borderRightWidth;
                var borderBottomWidth = styles.borderBottomWidth;
                var borderLeftWidth = styles.borderLeftWidth;
                var paddingTop = getAbsoluteValue(styles.paddingTop, element.bounds.width);
                var paddingRight = getAbsoluteValue(styles.paddingRight, element.bounds.width);
                var paddingBottom = getAbsoluteValue(styles.paddingBottom, element.bounds.width);
                var paddingLeft = getAbsoluteValue(styles.paddingLeft, element.bounds.width);
                this.topLeftBorderBox =
                    tlh > 0 || tlv > 0
                        ? getCurvePoints(bounds.left, bounds.top, tlh, tlv, CORNER.TOP_LEFT)
                        : new Vector(bounds.left, bounds.top);
                this.topRightBorderBox =
                    trh > 0 || trv > 0
                        ? getCurvePoints(bounds.left + topWidth, bounds.top, trh, trv, CORNER.TOP_RIGHT)
                        : new Vector(bounds.left + bounds.width, bounds.top);
                this.bottomRightBorderBox =
                    brh > 0 || brv > 0
                        ? getCurvePoints(bounds.left + bottomWidth, bounds.top + rightHeight, brh, brv, CORNER.BOTTOM_RIGHT)
                        : new Vector(bounds.left + bounds.width, bounds.top + bounds.height);
                this.bottomLeftBorderBox =
                    blh > 0 || blv > 0
                        ? getCurvePoints(bounds.left, bounds.top + leftHeight, blh, blv, CORNER.BOTTOM_LEFT)
                        : new Vector(bounds.left, bounds.top + bounds.height);
                this.topLeftPaddingBox =
                    tlh > 0 || tlv > 0
                        ? getCurvePoints(bounds.left + borderLeftWidth, bounds.top + borderTopWidth, Math.max(0, tlh - borderLeftWidth), Math.max(0, tlv - borderTopWidth), CORNER.TOP_LEFT)
                        : new Vector(bounds.left + borderLeftWidth, bounds.top + borderTopWidth);
                this.topRightPaddingBox =
                    trh > 0 || trv > 0
                        ? getCurvePoints(bounds.left + Math.min(topWidth, bounds.width + borderLeftWidth), bounds.top + borderTopWidth, topWidth > bounds.width + borderLeftWidth ? 0 : trh - borderLeftWidth, trv - borderTopWidth, CORNER.TOP_RIGHT)
                        : new Vector(bounds.left + bounds.width - borderRightWidth, bounds.top + borderTopWidth);
                this.bottomRightPaddingBox =
                    brh > 0 || brv > 0
                        ? getCurvePoints(bounds.left + Math.min(bottomWidth, bounds.width - borderLeftWidth), bounds.top + Math.min(rightHeight, bounds.height + borderTopWidth), Math.max(0, brh - borderRightWidth), brv - borderBottomWidth, CORNER.BOTTOM_RIGHT)
                        : new Vector(bounds.left + bounds.width - borderRightWidth, bounds.top + bounds.height - borderBottomWidth);
                this.bottomLeftPaddingBox =
                    blh > 0 || blv > 0
                        ? getCurvePoints(bounds.left + borderLeftWidth, bounds.top + leftHeight, Math.max(0, blh - borderLeftWidth), blv - borderBottomWidth, CORNER.BOTTOM_LEFT)
                        : new Vector(bounds.left + borderLeftWidth, bounds.top + bounds.height - borderBottomWidth);
                this.topLeftContentBox =
                    tlh > 0 || tlv > 0
                        ? getCurvePoints(bounds.left + borderLeftWidth + paddingLeft, bounds.top + borderTopWidth + paddingTop, Math.max(0, tlh - (borderLeftWidth + paddingLeft)), Math.max(0, tlv - (borderTopWidth + paddingTop)), CORNER.TOP_LEFT)
                        : new Vector(bounds.left + borderLeftWidth + paddingLeft, bounds.top + borderTopWidth + paddingTop);
                this.topRightContentBox =
                    trh > 0 || trv > 0
                        ? getCurvePoints(bounds.left + Math.min(topWidth, bounds.width + borderLeftWidth + paddingLeft), bounds.top + borderTopWidth + paddingTop, topWidth > bounds.width + borderLeftWidth + paddingLeft ? 0 : trh - borderLeftWidth + paddingLeft, trv - (borderTopWidth + paddingTop), CORNER.TOP_RIGHT)
                        : new Vector(bounds.left + bounds.width - (borderRightWidth + paddingRight), bounds.top + borderTopWidth + paddingTop);
                this.bottomRightContentBox =
                    brh > 0 || brv > 0
                        ? getCurvePoints(bounds.left + Math.min(bottomWidth, bounds.width - (borderLeftWidth + paddingLeft)), bounds.top + Math.min(rightHeight, bounds.height + borderTopWidth + paddingTop), Math.max(0, brh - (borderRightWidth + paddingRight)), brv - (borderBottomWidth + paddingBottom), CORNER.BOTTOM_RIGHT)
                        : new Vector(bounds.left + bounds.width - (borderRightWidth + paddingRight), bounds.top + bounds.height - (borderBottomWidth + paddingBottom));
                this.bottomLeftContentBox =
                    blh > 0 || blv > 0
                        ? getCurvePoints(bounds.left + borderLeftWidth + paddingLeft, bounds.top + leftHeight, Math.max(0, blh - (borderLeftWidth + paddingLeft)), blv - (borderBottomWidth + paddingBottom), CORNER.BOTTOM_LEFT)
                        : new Vector(bounds.left + borderLeftWidth + paddingLeft, bounds.top + bounds.height - (borderBottomWidth + paddingBottom));
            }
            return BoundCurves;
        }());
        var CORNER;
        (function (CORNER) {
            CORNER[CORNER["TOP_LEFT"] = 0] = "TOP_LEFT";
            CORNER[CORNER["TOP_RIGHT"] = 1] = "TOP_RIGHT";
            CORNER[CORNER["BOTTOM_RIGHT"] = 2] = "BOTTOM_RIGHT";
            CORNER[CORNER["BOTTOM_LEFT"] = 3] = "BOTTOM_LEFT";
        })(CORNER || (CORNER = {}));
        var getCurvePoints = function (x, y, r1, r2, position) {
            var kappa = 4 * ((Math.sqrt(2) - 1) / 3);
            var ox = r1 * kappa; // control point offset horizontal
            var oy = r2 * kappa; // control point offset vertical
            var xm = x + r1; // x-middle
            var ym = y + r2; // y-middle
            switch (position) {
                case CORNER.TOP_LEFT:
                    return new BezierCurve(new Vector(x, ym), new Vector(x, ym - oy), new Vector(xm - ox, y), new Vector(xm, y));
                case CORNER.TOP_RIGHT:
                    return new BezierCurve(new Vector(x, y), new Vector(x + ox, y), new Vector(xm, ym - oy), new Vector(xm, ym));
                case CORNER.BOTTOM_RIGHT:
                    return new BezierCurve(new Vector(xm, y), new Vector(xm, y + oy), new Vector(x + ox, ym), new Vector(x, ym));
                case CORNER.BOTTOM_LEFT:
                default:
                    return new BezierCurve(new Vector(xm, ym), new Vector(xm - ox, ym), new Vector(x, y + oy), new Vector(x, y));
            }
        };
        var calculateBorderBoxPath = function (curves) {
            return [curves.topLeftBorderBox, curves.topRightBorderBox, curves.bottomRightBorderBox, curves.bottomLeftBorderBox];
        };
        var calculateContentBoxPath = function (curves) {
            return [
                curves.topLeftContentBox,
                curves.topRightContentBox,
                curves.bottomRightContentBox,
                curves.bottomLeftContentBox
            ];
        };
        var calculatePaddingBoxPath = function (curves) {
            return [
                curves.topLeftPaddingBox,
                curves.topRightPaddingBox,
                curves.bottomRightPaddingBox,
                curves.bottomLeftPaddingBox
            ];
        };

        var TransformEffect = /** @class */ (function () {
            function TransformEffect(offsetX, offsetY, matrix) {
                this.type = 0 /* TRANSFORM */;
                this.offsetX = offsetX;
                this.offsetY = offsetY;
                this.matrix = matrix;
                this.target = 2 /* BACKGROUND_BORDERS */ | 4 /* CONTENT */;
            }
            return TransformEffect;
        }());
        var ClipEffect = /** @class */ (function () {
            function ClipEffect(path, target) {
                this.type = 1 /* CLIP */;
                this.target = target;
                this.path = path;
            }
            return ClipEffect;
        }());
        var isTransformEffect = function (effect) {
            return effect.type === 0 /* TRANSFORM */;
        };
        var isClipEffect = function (effect) { return effect.type === 1 /* CLIP */; };

        var StackingContext = /** @class */ (function () {
            function StackingContext(container) {
                this.element = container;
                this.inlineLevel = [];
                this.nonInlineLevel = [];
                this.negativeZIndex = [];
                this.zeroOrAutoZIndexOrTransformedOrOpacity = [];
                this.positiveZIndex = [];
                this.nonPositionedFloats = [];
                this.nonPositionedInlineLevel = [];
            }
            return StackingContext;
        }());
        var ElementPaint = /** @class */ (function () {
            function ElementPaint(element, parentStack) {
                this.container = element;
                this.effects = parentStack.slice(0);
                this.curves = new BoundCurves(element);
                if (element.styles.transform !== null) {
                    var offsetX = element.bounds.left + element.styles.transformOrigin[0].number;
                    var offsetY = element.bounds.top + element.styles.transformOrigin[1].number;
                    var matrix = element.styles.transform;
                    this.effects.push(new TransformEffect(offsetX, offsetY, matrix));
                }
                if (element.styles.overflowX !== OVERFLOW.VISIBLE) {
                    var borderBox = calculateBorderBoxPath(this.curves);
                    var paddingBox = calculatePaddingBoxPath(this.curves);
                    if (equalPath(borderBox, paddingBox)) {
                        this.effects.push(new ClipEffect(borderBox, 2 /* BACKGROUND_BORDERS */ | 4 /* CONTENT */));
                    }
                    else {
                        this.effects.push(new ClipEffect(borderBox, 2 /* BACKGROUND_BORDERS */));
                        this.effects.push(new ClipEffect(paddingBox, 4 /* CONTENT */));
                    }
                }
            }
            ElementPaint.prototype.getParentEffects = function () {
                var effects = this.effects.slice(0);
                if (this.container.styles.overflowX !== OVERFLOW.VISIBLE) {
                    var borderBox = calculateBorderBoxPath(this.curves);
                    var paddingBox = calculatePaddingBoxPath(this.curves);
                    if (!equalPath(borderBox, paddingBox)) {
                        effects.push(new ClipEffect(paddingBox, 2 /* BACKGROUND_BORDERS */ | 4 /* CONTENT */));
                    }
                }
                return effects;
            };
            return ElementPaint;
        }());
        var parseStackTree = function (parent, stackingContext, realStackingContext, listItems) {
            parent.container.elements.forEach(function (child) {
                var treatAsRealStackingContext = contains(child.flags, 4 /* CREATES_REAL_STACKING_CONTEXT */);
                var createsStackingContext = contains(child.flags, 2 /* CREATES_STACKING_CONTEXT */);
                var paintContainer = new ElementPaint(child, parent.getParentEffects());
                if (contains(child.styles.display, 2048 /* LIST_ITEM */)) {
                    listItems.push(paintContainer);
                }
                var listOwnerItems = contains(child.flags, 8 /* IS_LIST_OWNER */) ? [] : listItems;
                if (treatAsRealStackingContext || createsStackingContext) {
                    var parentStack = treatAsRealStackingContext || child.styles.isPositioned() ? realStackingContext : stackingContext;
                    var stack = new StackingContext(paintContainer);
                    if (child.styles.isPositioned() || child.styles.opacity < 1 || child.styles.isTransformed()) {
                        var order_1 = child.styles.zIndex.order;
                        if (order_1 < 0) {
                            var index_1 = 0;
                            parentStack.negativeZIndex.some(function (current, i) {
                                if (order_1 > current.element.container.styles.zIndex.order) {
                                    index_1 = i;
                                    return false;
                                }
                                else if (index_1 > 0) {
                                    return true;
                                }
                                return false;
                            });
                            parentStack.negativeZIndex.splice(index_1, 0, stack);
                        }
                        else if (order_1 > 0) {
                            var index_2 = 0;
                            parentStack.positiveZIndex.some(function (current, i) {
                                if (order_1 >= current.element.container.styles.zIndex.order) {
                                    index_2 = i + 1;
                                    return false;
                                }
                                else if (index_2 > 0) {
                                    return true;
                                }
                                return false;
                            });
                            parentStack.positiveZIndex.splice(index_2, 0, stack);
                        }
                        else {
                            parentStack.zeroOrAutoZIndexOrTransformedOrOpacity.push(stack);
                        }
                    }
                    else {
                        if (child.styles.isFloating()) {
                            parentStack.nonPositionedFloats.push(stack);
                        }
                        else {
                            parentStack.nonPositionedInlineLevel.push(stack);
                        }
                    }
                    parseStackTree(paintContainer, stack, treatAsRealStackingContext ? stack : realStackingContext, listOwnerItems);
                }
                else {
                    if (child.styles.isInlineLevel()) {
                        stackingContext.inlineLevel.push(paintContainer);
                    }
                    else {
                        stackingContext.nonInlineLevel.push(paintContainer);
                    }
                    parseStackTree(paintContainer, stackingContext, realStackingContext, listOwnerItems);
                }
                if (contains(child.flags, 8 /* IS_LIST_OWNER */)) {
                    processListItems(child, listOwnerItems);
                }
            });
        };
        var processListItems = function (owner, elements) {
            var numbering = owner instanceof OLElementContainer ? owner.start : 1;
            var reversed = owner instanceof OLElementContainer ? owner.reversed : false;
            for (var i = 0; i < elements.length; i++) {
                var item = elements[i];
                if (item.container instanceof LIElementContainer &&
                    typeof item.container.value === 'number' &&
                    item.container.value !== 0) {
                    numbering = item.container.value;
                }
                item.listValue = createCounterText(numbering, item.container.styles.listStyleType, true);
                numbering += reversed ? -1 : 1;
            }
        };
        var parseStackingContexts = function (container) {
            var paintContainer = new ElementPaint(container, []);
            var root = new StackingContext(paintContainer);
            var listItems = [];
            parseStackTree(paintContainer, root, root, listItems);
            processListItems(paintContainer.container, listItems);
            return root;
        };

        var parsePathForBorder = function (curves, borderSide) {
            switch (borderSide) {
                case 0:
                    return createPathFromCurves(curves.topLeftBorderBox, curves.topLeftPaddingBox, curves.topRightBorderBox, curves.topRightPaddingBox);
                case 1:
                    return createPathFromCurves(curves.topRightBorderBox, curves.topRightPaddingBox, curves.bottomRightBorderBox, curves.bottomRightPaddingBox);
                case 2:
                    return createPathFromCurves(curves.bottomRightBorderBox, curves.bottomRightPaddingBox, curves.bottomLeftBorderBox, curves.bottomLeftPaddingBox);
                case 3:
                default:
                    return createPathFromCurves(curves.bottomLeftBorderBox, curves.bottomLeftPaddingBox, curves.topLeftBorderBox, curves.topLeftPaddingBox);
            }
        };
        var createPathFromCurves = function (outer1, inner1, outer2, inner2) {
            var path = [];
            if (isBezierCurve(outer1)) {
                path.push(outer1.subdivide(0.5, false));
            }
            else {
                path.push(outer1);
            }
            if (isBezierCurve(outer2)) {
                path.push(outer2.subdivide(0.5, true));
            }
            else {
                path.push(outer2);
            }
            if (isBezierCurve(inner2)) {
                path.push(inner2.subdivide(0.5, true).reverse());
            }
            else {
                path.push(inner2);
            }
            if (isBezierCurve(inner1)) {
                path.push(inner1.subdivide(0.5, false).reverse());
            }
            else {
                path.push(inner1);
            }
            return path;
        };

        var paddingBox = function (element) {
            var bounds = element.bounds;
            var styles = element.styles;
            return bounds.add(styles.borderLeftWidth, styles.borderTopWidth, -(styles.borderRightWidth + styles.borderLeftWidth), -(styles.borderTopWidth + styles.borderBottomWidth));
        };
        var contentBox = function (element) {
            var styles = element.styles;
            var bounds = element.bounds;
            var paddingLeft = getAbsoluteValue(styles.paddingLeft, bounds.width);
            var paddingRight = getAbsoluteValue(styles.paddingRight, bounds.width);
            var paddingTop = getAbsoluteValue(styles.paddingTop, bounds.width);
            var paddingBottom = getAbsoluteValue(styles.paddingBottom, bounds.width);
            return bounds.add(paddingLeft + styles.borderLeftWidth, paddingTop + styles.borderTopWidth, -(styles.borderRightWidth + styles.borderLeftWidth + paddingLeft + paddingRight), -(styles.borderTopWidth + styles.borderBottomWidth + paddingTop + paddingBottom));
        };

        var calculateBackgroundPositioningArea = function (backgroundOrigin, element) {
            if (backgroundOrigin === 0 /* BORDER_BOX */) {
                return element.bounds;
            }
            if (backgroundOrigin === 2 /* CONTENT_BOX */) {
                return contentBox(element);
            }
            return paddingBox(element);
        };
        var calculateBackgroundPaintingArea = function (backgroundClip, element) {
            if (backgroundClip === BACKGROUND_CLIP.BORDER_BOX) {
                return element.bounds;
            }
            if (backgroundClip === BACKGROUND_CLIP.CONTENT_BOX) {
                return contentBox(element);
            }
            return paddingBox(element);
        };
        var calculateBackgroundRendering = function (container, index, intrinsicSize) {
            var backgroundPositioningArea = calculateBackgroundPositioningArea(getBackgroundValueForIndex(container.styles.backgroundOrigin, index), container);
            var backgroundPaintingArea = calculateBackgroundPaintingArea(getBackgroundValueForIndex(container.styles.backgroundClip, index), container);
            var backgroundImageSize = calculateBackgroundSize(getBackgroundValueForIndex(container.styles.backgroundSize, index), intrinsicSize, backgroundPositioningArea);
            var sizeWidth = backgroundImageSize[0], sizeHeight = backgroundImageSize[1];
            var position = getAbsoluteValueForTuple(getBackgroundValueForIndex(container.styles.backgroundPosition, index), backgroundPositioningArea.width - sizeWidth, backgroundPositioningArea.height - sizeHeight);
            var path = calculateBackgroundRepeatPath(getBackgroundValueForIndex(container.styles.backgroundRepeat, index), position, backgroundImageSize, backgroundPositioningArea, backgroundPaintingArea);
            var offsetX = Math.round(backgroundPositioningArea.left + position[0]);
            var offsetY = Math.round(backgroundPositioningArea.top + position[1]);
            return [path, offsetX, offsetY, sizeWidth, sizeHeight];
        };
        var isAuto = function (token) { return isIdentToken(token) && token.value === BACKGROUND_SIZE.AUTO; };
        var hasIntrinsicValue = function (value) { return typeof value === 'number'; };
        var calculateBackgroundSize = function (size, _a, bounds) {
            var intrinsicWidth = _a[0], intrinsicHeight = _a[1], intrinsicProportion = _a[2];
            var first = size[0], second = size[1];
            if (isLengthPercentage(first) && second && isLengthPercentage(second)) {
                return [getAbsoluteValue(first, bounds.width), getAbsoluteValue(second, bounds.height)];
            }
            var hasIntrinsicProportion = hasIntrinsicValue(intrinsicProportion);
            if (isIdentToken(first) && (first.value === BACKGROUND_SIZE.CONTAIN || first.value === BACKGROUND_SIZE.COVER)) {
                if (hasIntrinsicValue(intrinsicProportion)) {
                    var targetRatio = bounds.width / bounds.height;
                    return targetRatio < intrinsicProportion !== (first.value === BACKGROUND_SIZE.COVER)
                        ? [bounds.width, bounds.width / intrinsicProportion]
                        : [bounds.height * intrinsicProportion, bounds.height];
                }
                return [bounds.width, bounds.height];
            }
            var hasIntrinsicWidth = hasIntrinsicValue(intrinsicWidth);
            var hasIntrinsicHeight = hasIntrinsicValue(intrinsicHeight);
            var hasIntrinsicDimensions = hasIntrinsicWidth || hasIntrinsicHeight;
            // If the background-size is auto or auto auto:
            if (isAuto(first) && (!second || isAuto(second))) {
                // If the image has both horizontal and vertical intrinsic dimensions, it's rendered at that size.
                if (hasIntrinsicWidth && hasIntrinsicHeight) {
                    return [intrinsicWidth, intrinsicHeight];
                }
                // If the image has no intrinsic dimensions and has no intrinsic proportions,
                // it's rendered at the size of the background positioning area.
                if (!hasIntrinsicProportion && !hasIntrinsicDimensions) {
                    return [bounds.width, bounds.height];
                }
                // TODO If the image has no intrinsic dimensions but has intrinsic proportions, it's rendered as if contain had been specified instead.
                // If the image has only one intrinsic dimension and has intrinsic proportions, it's rendered at the size corresponding to that one dimension.
                // The other dimension is computed using the specified dimension and the intrinsic proportions.
                if (hasIntrinsicDimensions && hasIntrinsicProportion) {
                    var width_1 = hasIntrinsicWidth
                        ? intrinsicWidth
                        : intrinsicHeight * intrinsicProportion;
                    var height_1 = hasIntrinsicHeight
                        ? intrinsicHeight
                        : intrinsicWidth / intrinsicProportion;
                    return [width_1, height_1];
                }
                // If the image has only one intrinsic dimension but has no intrinsic proportions,
                // it's rendered using the specified dimension and the other dimension of the background positioning area.
                var width_2 = hasIntrinsicWidth ? intrinsicWidth : bounds.width;
                var height_2 = hasIntrinsicHeight ? intrinsicHeight : bounds.height;
                return [width_2, height_2];
            }
            // If the image has intrinsic proportions, it's stretched to the specified dimension.
            // The unspecified dimension is computed using the specified dimension and the intrinsic proportions.
            if (hasIntrinsicProportion) {
                var width_3 = 0;
                var height_3 = 0;
                if (isLengthPercentage(first)) {
                    width_3 = getAbsoluteValue(first, bounds.width);
                }
                else if (isLengthPercentage(second)) {
                    height_3 = getAbsoluteValue(second, bounds.height);
                }
                if (isAuto(first)) {
                    width_3 = height_3 * intrinsicProportion;
                }
                else if (!second || isAuto(second)) {
                    height_3 = width_3 / intrinsicProportion;
                }
                return [width_3, height_3];
            }
            // If the image has no intrinsic proportions, it's stretched to the specified dimension.
            // The unspecified dimension is computed using the image's corresponding intrinsic dimension,
            // if there is one. If there is no such intrinsic dimension,
            // it becomes the corresponding dimension of the background positioning area.
            var width = null;
            var height = null;
            if (isLengthPercentage(first)) {
                width = getAbsoluteValue(first, bounds.width);
            }
            else if (second && isLengthPercentage(second)) {
                height = getAbsoluteValue(second, bounds.height);
            }
            if (width !== null && (!second || isAuto(second))) {
                height =
                    hasIntrinsicWidth && hasIntrinsicHeight
                        ? (width / intrinsicWidth) * intrinsicHeight
                        : bounds.height;
            }
            if (height !== null && isAuto(first)) {
                width =
                    hasIntrinsicWidth && hasIntrinsicHeight
                        ? (height / intrinsicHeight) * intrinsicWidth
                        : bounds.width;
            }
            if (width !== null && height !== null) {
                return [width, height];
            }
            throw new Error("Unable to calculate background-size for element");
        };
        var getBackgroundValueForIndex = function (values, index) {
            var value = values[index];
            if (typeof value === 'undefined') {
                return values[0];
            }
            return value;
        };
        var calculateBackgroundRepeatPath = function (repeat, _a, _b, backgroundPositioningArea, backgroundPaintingArea) {
            var x = _a[0], y = _a[1];
            var width = _b[0], height = _b[1];
            switch (repeat) {
                case BACKGROUND_REPEAT.REPEAT_X:
                    return [
                        new Vector(Math.round(backgroundPositioningArea.left), Math.round(backgroundPositioningArea.top + y)),
                        new Vector(Math.round(backgroundPositioningArea.left + backgroundPositioningArea.width), Math.round(backgroundPositioningArea.top + y)),
                        new Vector(Math.round(backgroundPositioningArea.left + backgroundPositioningArea.width), Math.round(height + backgroundPositioningArea.top + y)),
                        new Vector(Math.round(backgroundPositioningArea.left), Math.round(height + backgroundPositioningArea.top + y))
                    ];
                case BACKGROUND_REPEAT.REPEAT_Y:
                    return [
                        new Vector(Math.round(backgroundPositioningArea.left + x), Math.round(backgroundPositioningArea.top)),
                        new Vector(Math.round(backgroundPositioningArea.left + x + width), Math.round(backgroundPositioningArea.top)),
                        new Vector(Math.round(backgroundPositioningArea.left + x + width), Math.round(backgroundPositioningArea.height + backgroundPositioningArea.top)),
                        new Vector(Math.round(backgroundPositioningArea.left + x), Math.round(backgroundPositioningArea.height + backgroundPositioningArea.top))
                    ];
                case BACKGROUND_REPEAT.NO_REPEAT:
                    return [
                        new Vector(Math.round(backgroundPositioningArea.left + x), Math.round(backgroundPositioningArea.top + y)),
                        new Vector(Math.round(backgroundPositioningArea.left + x + width), Math.round(backgroundPositioningArea.top + y)),
                        new Vector(Math.round(backgroundPositioningArea.left + x + width), Math.round(backgroundPositioningArea.top + y + height)),
                        new Vector(Math.round(backgroundPositioningArea.left + x), Math.round(backgroundPositioningArea.top + y + height))
                    ];
                default:
                    return [
                        new Vector(Math.round(backgroundPaintingArea.left), Math.round(backgroundPaintingArea.top)),
                        new Vector(Math.round(backgroundPaintingArea.left + backgroundPaintingArea.width), Math.round(backgroundPaintingArea.top)),
                        new Vector(Math.round(backgroundPaintingArea.left + backgroundPaintingArea.width), Math.round(backgroundPaintingArea.height + backgroundPaintingArea.top)),
                        new Vector(Math.round(backgroundPaintingArea.left), Math.round(backgroundPaintingArea.height + backgroundPaintingArea.top))
                    ];
            }
        };

        var SMALL_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

        var SAMPLE_TEXT = 'Hidden Text';
        var FontMetrics = /** @class */ (function () {
            function FontMetrics(document) {
                this._data = {};
                this._document = document;
            }
            FontMetrics.prototype.parseMetrics = function (fontFamily, fontSize) {
                var container = this._document.createElement('div');
                var img = this._document.createElement('img');
                var span = this._document.createElement('span');
                var body = this._document.body;
                container.style.visibility = 'hidden';
                container.style.fontFamily = fontFamily;
                container.style.fontSize = fontSize;
                container.style.margin = '0';
                container.style.padding = '0';
                body.appendChild(container);
                img.src = SMALL_IMAGE;
                img.width = 1;
                img.height = 1;
                img.style.margin = '0';
                img.style.padding = '0';
                img.style.verticalAlign = 'baseline';
                span.style.fontFamily = fontFamily;
                span.style.fontSize = fontSize;
                span.style.margin = '0';
                span.style.padding = '0';
                span.appendChild(this._document.createTextNode(SAMPLE_TEXT));
                container.appendChild(span);
                container.appendChild(img);
                var baseline = img.offsetTop - span.offsetTop + 2;
                container.removeChild(span);
                container.appendChild(this._document.createTextNode(SAMPLE_TEXT));
                container.style.lineHeight = 'normal';
                img.style.verticalAlign = 'super';
                var middle = img.offsetTop - container.offsetTop + 2;
                body.removeChild(container);
                return { baseline: baseline, middle: middle };
            };
            FontMetrics.prototype.getMetrics = function (fontFamily, fontSize) {
                var key = fontFamily + " " + fontSize;
                if (typeof this._data[key] === 'undefined') {
                    this._data[key] = this.parseMetrics(fontFamily, fontSize);
                }
                return this._data[key];
            };
            return FontMetrics;
        }());

        var MASK_OFFSET = 10000;
        var CanvasRenderer = /** @class */ (function () {
            function CanvasRenderer(options) {
                this._activeEffects = [];
                this.canvas = options.canvas ? options.canvas : document.createElement('canvas');
                this.ctx = this.canvas.getContext('2d');
                this.options = options;
                if (!options.canvas) {
                    this.canvas.width = Math.floor(options.width * options.scale);
                    this.canvas.height = Math.floor(options.height * options.scale);
                    this.canvas.style.width = options.width + "px";
                    this.canvas.style.height = options.height + "px";
                }
                this.fontMetrics = new FontMetrics(document);
                this.ctx.scale(this.options.scale, this.options.scale);
                this.ctx.translate(-options.x + options.scrollX, -options.y + options.scrollY);
                this.ctx.textBaseline = 'bottom';
                this._activeEffects = [];
                Logger.getInstance(options.id).debug("Canvas renderer initialized (" + options.width + "x" + options.height + " at " + options.x + "," + options.y + ") with scale " + options.scale);
            }
            CanvasRenderer.prototype.applyEffects = function (effects, target) {
                var _this = this;
                while (this._activeEffects.length) {
                    this.popEffect();
                }
                effects.filter(function (effect) { return contains(effect.target, target); }).forEach(function (effect) { return _this.applyEffect(effect); });
            };
            CanvasRenderer.prototype.applyEffect = function (effect) {
                this.ctx.save();
                if (isTransformEffect(effect)) {
                    this.ctx.translate(effect.offsetX, effect.offsetY);
                    this.ctx.transform(effect.matrix[0], effect.matrix[1], effect.matrix[2], effect.matrix[3], effect.matrix[4], effect.matrix[5]);
                    this.ctx.translate(-effect.offsetX, -effect.offsetY);
                }
                if (isClipEffect(effect)) {
                    this.path(effect.path);
                    this.ctx.clip();
                }
                this._activeEffects.push(effect);
            };
            CanvasRenderer.prototype.popEffect = function () {
                this._activeEffects.pop();
                this.ctx.restore();
            };
            CanvasRenderer.prototype.renderStack = function (stack) {
                return __awaiter(this, void 0, void 0, function () {
                    var styles;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                styles = stack.element.container.styles;
                                if (!styles.isVisible()) return [3 /*break*/, 2];
                                this.ctx.globalAlpha = styles.opacity;
                                return [4 /*yield*/, this.renderStackContent(stack)];
                            case 1:
                                _a.sent();
                                _a.label = 2;
                            case 2: return [2 /*return*/];
                        }
                    });
                });
            };
            CanvasRenderer.prototype.renderNode = function (paint) {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!paint.container.styles.isVisible()) return [3 /*break*/, 3];
                                return [4 /*yield*/, this.renderNodeBackgroundAndBorders(paint)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, this.renderNodeContent(paint)];
                            case 2:
                                _a.sent();
                                _a.label = 3;
                            case 3: return [2 /*return*/];
                        }
                    });
                });
            };
            CanvasRenderer.prototype.renderTextWithLetterSpacing = function (text, letterSpacing) {
                var _this = this;
                if (letterSpacing === 0) {
                    this.ctx.fillText(text.text, text.bounds.left, text.bounds.top + text.bounds.height);
                }
                else {
                    var letters = toCodePoints(text.text).map(function (i) { return fromCodePoint(i); });
                    letters.reduce(function (left, letter) {
                        _this.ctx.fillText(letter, left, text.bounds.top + text.bounds.height);
                        return left + _this.ctx.measureText(letter).width;
                    }, text.bounds.left);
                }
            };
            CanvasRenderer.prototype.createFontStyle = function (styles) {
                var fontVariant = styles.fontVariant
                    .filter(function (variant) { return variant === 'normal' || variant === 'small-caps'; })
                    .join('');
                var fontFamily = styles.fontFamily.join(', ');
                var fontSize = isDimensionToken(styles.fontSize)
                    ? "" + styles.fontSize.number + styles.fontSize.unit
                    : styles.fontSize.number + "px";
                return [
                    [styles.fontStyle, fontVariant, styles.fontWeight, fontSize, fontFamily].join(' '),
                    fontFamily,
                    fontSize
                ];
            };
            CanvasRenderer.prototype.renderTextNode = function (text, styles) {
                return __awaiter(this, void 0, void 0, function () {
                    var _a, font, fontFamily, fontSize;
                    var _this = this;
                    return __generator(this, function (_b) {
                        _a = this.createFontStyle(styles), font = _a[0], fontFamily = _a[1], fontSize = _a[2];
                        this.ctx.font = font;
                        text.textBounds.forEach(function (text) {
                            _this.ctx.fillStyle = asString(styles.color);
                            _this.renderTextWithLetterSpacing(text, styles.letterSpacing);
                            var textShadows = styles.textShadow;
                            if (textShadows.length && text.text.trim().length) {
                                textShadows
                                    .slice(0)
                                    .reverse()
                                    .forEach(function (textShadow) {
                                    _this.ctx.shadowColor = asString(textShadow.color);
                                    _this.ctx.shadowOffsetX = textShadow.offsetX.number * _this.options.scale;
                                    _this.ctx.shadowOffsetY = textShadow.offsetY.number * _this.options.scale;
                                    _this.ctx.shadowBlur = textShadow.blur.number;
                                    _this.ctx.fillText(text.text, text.bounds.left, text.bounds.top + text.bounds.height);
                                });
                                _this.ctx.shadowColor = '';
                                _this.ctx.shadowOffsetX = 0;
                                _this.ctx.shadowOffsetY = 0;
                                _this.ctx.shadowBlur = 0;
                            }
                            if (styles.textDecorationLine.length) {
                                _this.ctx.fillStyle = asString(styles.textDecorationColor || styles.color);
                                styles.textDecorationLine.forEach(function (textDecorationLine) {
                                    switch (textDecorationLine) {
                                        case 1 /* UNDERLINE */:
                                            // Draws a line at the baseline of the font
                                            // TODO As some browsers display the line as more than 1px if the font-size is big,
                                            // need to take that into account both in position and size
                                            var baseline = _this.fontMetrics.getMetrics(fontFamily, fontSize).baseline;
                                            _this.ctx.fillRect(text.bounds.left, Math.round(text.bounds.top + baseline), text.bounds.width, 1);
                                            break;
                                        case 2 /* OVERLINE */:
                                            _this.ctx.fillRect(text.bounds.left, Math.round(text.bounds.top), text.bounds.width, 1);
                                            break;
                                        case 3 /* LINE_THROUGH */:
                                            // TODO try and find exact position for line-through
                                            var middle = _this.fontMetrics.getMetrics(fontFamily, fontSize).middle;
                                            _this.ctx.fillRect(text.bounds.left, Math.ceil(text.bounds.top + middle), text.bounds.width, 1);
                                            break;
                                    }
                                });
                            }
                        });
                        return [2 /*return*/];
                    });
                });
            };
            CanvasRenderer.prototype.renderReplacedElement = function (container, curves, image) {
                if (image && container.intrinsicWidth > 0 && container.intrinsicHeight > 0) {
                    var box = contentBox(container);
                    var path = calculatePaddingBoxPath(curves);
                    this.path(path);
                    this.ctx.save();
                    this.ctx.clip();
                    this.ctx.drawImage(image, 0, 0, container.intrinsicWidth, container.intrinsicHeight, box.left, box.top, box.width, box.height);
                    this.ctx.restore();
                }
            };
            CanvasRenderer.prototype.renderNodeContent = function (paint) {
                return __awaiter(this, void 0, void 0, function () {
                    var container, curves, styles, _i, _a, child, image, image, iframeRenderer, canvas, size, bounds, x, textBounds, img, image, url, bounds;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                this.applyEffects(paint.effects, 4 /* CONTENT */);
                                container = paint.container;
                                curves = paint.curves;
                                styles = container.styles;
                                _i = 0, _a = container.textNodes;
                                _b.label = 1;
                            case 1:
                                if (!(_i < _a.length)) return [3 /*break*/, 4];
                                child = _a[_i];
                                return [4 /*yield*/, this.renderTextNode(child, styles)];
                            case 2:
                                _b.sent();
                                _b.label = 3;
                            case 3:
                                _i++;
                                return [3 /*break*/, 1];
                            case 4:
                                if (!(container instanceof ImageElementContainer)) return [3 /*break*/, 8];
                                _b.label = 5;
                            case 5:
                                _b.trys.push([5, 7, , 8]);
                                return [4 /*yield*/, this.options.cache.match(container.src)];
                            case 6:
                                image = _b.sent();
                                this.renderReplacedElement(container, curves, image);
                                return [3 /*break*/, 8];
                            case 7:
                                _b.sent();
                                Logger.getInstance(this.options.id).error("Error loading image " + container.src);
                                return [3 /*break*/, 8];
                            case 8:
                                if (container instanceof CanvasElementContainer) {
                                    this.renderReplacedElement(container, curves, container.canvas);
                                }
                                if (!(container instanceof SVGElementContainer)) return [3 /*break*/, 12];
                                _b.label = 9;
                            case 9:
                                _b.trys.push([9, 11, , 12]);
                                return [4 /*yield*/, this.options.cache.match(container.svg)];
                            case 10:
                                image = _b.sent();
                                this.renderReplacedElement(container, curves, image);
                                return [3 /*break*/, 12];
                            case 11:
                                _b.sent();
                                Logger.getInstance(this.options.id).error("Error loading svg " + container.svg.substring(0, 255));
                                return [3 /*break*/, 12];
                            case 12:
                                if (!(container instanceof IFrameElementContainer && container.tree)) return [3 /*break*/, 14];
                                iframeRenderer = new CanvasRenderer({
                                    id: this.options.id,
                                    scale: this.options.scale,
                                    backgroundColor: container.backgroundColor,
                                    x: 0,
                                    y: 0,
                                    scrollX: 0,
                                    scrollY: 0,
                                    width: container.width,
                                    height: container.height,
                                    cache: this.options.cache,
                                    windowWidth: container.width,
                                    windowHeight: container.height
                                });
                                return [4 /*yield*/, iframeRenderer.render(container.tree)];
                            case 13:
                                canvas = _b.sent();
                                if (container.width && container.height) {
                                    this.ctx.drawImage(canvas, 0, 0, container.width, container.height, container.bounds.left, container.bounds.top, container.bounds.width, container.bounds.height);
                                }
                                _b.label = 14;
                            case 14:
                                if (container instanceof InputElementContainer) {
                                    size = Math.min(container.bounds.width, container.bounds.height);
                                    if (container.type === CHECKBOX) {
                                        if (container.checked) {
                                            this.ctx.save();
                                            this.path([
                                                new Vector(container.bounds.left + size * 0.39363, container.bounds.top + size * 0.79),
                                                new Vector(container.bounds.left + size * 0.16, container.bounds.top + size * 0.5549),
                                                new Vector(container.bounds.left + size * 0.27347, container.bounds.top + size * 0.44071),
                                                new Vector(container.bounds.left + size * 0.39694, container.bounds.top + size * 0.5649),
                                                new Vector(container.bounds.left + size * 0.72983, container.bounds.top + size * 0.23),
                                                new Vector(container.bounds.left + size * 0.84, container.bounds.top + size * 0.34085),
                                                new Vector(container.bounds.left + size * 0.39363, container.bounds.top + size * 0.79)
                                            ]);
                                            this.ctx.fillStyle = asString(INPUT_COLOR);
                                            this.ctx.fill();
                                            this.ctx.restore();
                                        }
                                    }
                                    else if (container.type === RADIO) {
                                        if (container.checked) {
                                            this.ctx.save();
                                            this.ctx.beginPath();
                                            this.ctx.arc(container.bounds.left + size / 2, container.bounds.top + size / 2, size / 4, 0, Math.PI * 2, true);
                                            this.ctx.fillStyle = asString(INPUT_COLOR);
                                            this.ctx.fill();
                                            this.ctx.restore();
                                        }
                                    }
                                }
                                if (isTextInputElement(container) && container.value.length) {
                                    this.ctx.font = this.createFontStyle(styles)[0];
                                    this.ctx.fillStyle = asString(styles.color);
                                    this.ctx.textBaseline = 'middle';
                                    this.ctx.textAlign = canvasTextAlign(container.styles.textAlign);
                                    bounds = contentBox(container);
                                    x = 0;
                                    switch (container.styles.textAlign) {
                                        case TEXT_ALIGN.CENTER:
                                            x += bounds.width / 2;
                                            break;
                                        case TEXT_ALIGN.RIGHT:
                                            x += bounds.width;
                                            break;
                                    }
                                    textBounds = bounds.add(x, 0, 0, -bounds.height / 2 + 1);
                                    this.ctx.save();
                                    this.path([
                                        new Vector(bounds.left, bounds.top),
                                        new Vector(bounds.left + bounds.width, bounds.top),
                                        new Vector(bounds.left + bounds.width, bounds.top + bounds.height),
                                        new Vector(bounds.left, bounds.top + bounds.height)
                                    ]);
                                    this.ctx.clip();
                                    this.renderTextWithLetterSpacing(new TextBounds(container.value, textBounds), styles.letterSpacing);
                                    this.ctx.restore();
                                    this.ctx.textBaseline = 'bottom';
                                    this.ctx.textAlign = 'left';
                                }
                                if (!contains(container.styles.display, 2048 /* LIST_ITEM */)) return [3 /*break*/, 20];
                                if (!(container.styles.listStyleImage !== null)) return [3 /*break*/, 19];
                                img = container.styles.listStyleImage;
                                if (!(img.type === CSSImageType.URL)) return [3 /*break*/, 18];
                                image = void 0;
                                url = img.url;
                                _b.label = 15;
                            case 15:
                                _b.trys.push([15, 17, , 18]);
                                return [4 /*yield*/, this.options.cache.match(url)];
                            case 16:
                                image = _b.sent();
                                this.ctx.drawImage(image, container.bounds.left - (image.width + 10), container.bounds.top);
                                return [3 /*break*/, 18];
                            case 17:
                                _b.sent();
                                Logger.getInstance(this.options.id).error("Error loading list-style-image " + url);
                                return [3 /*break*/, 18];
                            case 18: return [3 /*break*/, 20];
                            case 19:
                                if (paint.listValue && container.styles.listStyleType !== LIST_STYLE_TYPE.NONE) {
                                    this.ctx.font = this.createFontStyle(styles)[0];
                                    this.ctx.fillStyle = asString(styles.color);
                                    this.ctx.textBaseline = 'middle';
                                    this.ctx.textAlign = 'right';
                                    bounds = new Bounds(container.bounds.left, container.bounds.top + getAbsoluteValue(container.styles.paddingTop, container.bounds.width), container.bounds.width, computeLineHeight(styles.lineHeight, styles.fontSize.number) / 2 + 1);
                                    this.renderTextWithLetterSpacing(new TextBounds(paint.listValue, bounds), styles.letterSpacing);
                                    this.ctx.textBaseline = 'bottom';
                                    this.ctx.textAlign = 'left';
                                }
                                _b.label = 20;
                            case 20: return [2 /*return*/];
                        }
                    });
                });
            };
            CanvasRenderer.prototype.renderStackContent = function (stack) {
                return __awaiter(this, void 0, void 0, function () {
                    var _i, _a, child, _b, _c, child, _d, _e, child, _f, _g, child, _h, _j, child, _k, _l, child, _m, _o, child;
                    return __generator(this, function (_p) {
                        switch (_p.label) {
                            case 0: 
                            // https://www.w3.org/TR/css-position-3/#painting-order
                            // 1. the background and borders of the element forming the stacking context.
                            return [4 /*yield*/, this.renderNodeBackgroundAndBorders(stack.element)];
                            case 1:
                                // https://www.w3.org/TR/css-position-3/#painting-order
                                // 1. the background and borders of the element forming the stacking context.
                                _p.sent();
                                _i = 0, _a = stack.negativeZIndex;
                                _p.label = 2;
                            case 2:
                                if (!(_i < _a.length)) return [3 /*break*/, 5];
                                child = _a[_i];
                                return [4 /*yield*/, this.renderStack(child)];
                            case 3:
                                _p.sent();
                                _p.label = 4;
                            case 4:
                                _i++;
                                return [3 /*break*/, 2];
                            case 5: 
                            // 3. For all its in-flow, non-positioned, block-level descendants in tree order:
                            return [4 /*yield*/, this.renderNodeContent(stack.element)];
                            case 6:
                                // 3. For all its in-flow, non-positioned, block-level descendants in tree order:
                                _p.sent();
                                _b = 0, _c = stack.nonInlineLevel;
                                _p.label = 7;
                            case 7:
                                if (!(_b < _c.length)) return [3 /*break*/, 10];
                                child = _c[_b];
                                return [4 /*yield*/, this.renderNode(child)];
                            case 8:
                                _p.sent();
                                _p.label = 9;
                            case 9:
                                _b++;
                                return [3 /*break*/, 7];
                            case 10:
                                _d = 0, _e = stack.nonPositionedFloats;
                                _p.label = 11;
                            case 11:
                                if (!(_d < _e.length)) return [3 /*break*/, 14];
                                child = _e[_d];
                                return [4 /*yield*/, this.renderStack(child)];
                            case 12:
                                _p.sent();
                                _p.label = 13;
                            case 13:
                                _d++;
                                return [3 /*break*/, 11];
                            case 14:
                                _f = 0, _g = stack.nonPositionedInlineLevel;
                                _p.label = 15;
                            case 15:
                                if (!(_f < _g.length)) return [3 /*break*/, 18];
                                child = _g[_f];
                                return [4 /*yield*/, this.renderStack(child)];
                            case 16:
                                _p.sent();
                                _p.label = 17;
                            case 17:
                                _f++;
                                return [3 /*break*/, 15];
                            case 18:
                                _h = 0, _j = stack.inlineLevel;
                                _p.label = 19;
                            case 19:
                                if (!(_h < _j.length)) return [3 /*break*/, 22];
                                child = _j[_h];
                                return [4 /*yield*/, this.renderNode(child)];
                            case 20:
                                _p.sent();
                                _p.label = 21;
                            case 21:
                                _h++;
                                return [3 /*break*/, 19];
                            case 22:
                                _k = 0, _l = stack.zeroOrAutoZIndexOrTransformedOrOpacity;
                                _p.label = 23;
                            case 23:
                                if (!(_k < _l.length)) return [3 /*break*/, 26];
                                child = _l[_k];
                                return [4 /*yield*/, this.renderStack(child)];
                            case 24:
                                _p.sent();
                                _p.label = 25;
                            case 25:
                                _k++;
                                return [3 /*break*/, 23];
                            case 26:
                                _m = 0, _o = stack.positiveZIndex;
                                _p.label = 27;
                            case 27:
                                if (!(_m < _o.length)) return [3 /*break*/, 30];
                                child = _o[_m];
                                return [4 /*yield*/, this.renderStack(child)];
                            case 28:
                                _p.sent();
                                _p.label = 29;
                            case 29:
                                _m++;
                                return [3 /*break*/, 27];
                            case 30: return [2 /*return*/];
                        }
                    });
                });
            };
            CanvasRenderer.prototype.mask = function (paths) {
                this.ctx.beginPath();
                this.ctx.moveTo(0, 0);
                this.ctx.lineTo(this.canvas.width, 0);
                this.ctx.lineTo(this.canvas.width, this.canvas.height);
                this.ctx.lineTo(0, this.canvas.height);
                this.ctx.lineTo(0, 0);
                this.formatPath(paths.slice(0).reverse());
                this.ctx.closePath();
            };
            CanvasRenderer.prototype.path = function (paths) {
                this.ctx.beginPath();
                this.formatPath(paths);
                this.ctx.closePath();
            };
            CanvasRenderer.prototype.formatPath = function (paths) {
                var _this = this;
                paths.forEach(function (point, index) {
                    var start = isBezierCurve(point) ? point.start : point;
                    if (index === 0) {
                        _this.ctx.moveTo(start.x, start.y);
                    }
                    else {
                        _this.ctx.lineTo(start.x, start.y);
                    }
                    if (isBezierCurve(point)) {
                        _this.ctx.bezierCurveTo(point.startControl.x, point.startControl.y, point.endControl.x, point.endControl.y, point.end.x, point.end.y);
                    }
                });
            };
            CanvasRenderer.prototype.renderRepeat = function (path, pattern, offsetX, offsetY) {
                this.path(path);
                this.ctx.fillStyle = pattern;
                this.ctx.translate(offsetX, offsetY);
                this.ctx.fill();
                this.ctx.translate(-offsetX, -offsetY);
            };
            CanvasRenderer.prototype.resizeImage = function (image, width, height) {
                if (image.width === width && image.height === height) {
                    return image;
                }
                var canvas = this.canvas.ownerDocument.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                var ctx = canvas.getContext('2d');
                ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);
                return canvas;
            };
            CanvasRenderer.prototype.renderBackgroundImage = function (container) {
                return __awaiter(this, void 0, void 0, function () {
                    var index, _loop_1, this_1, _i, _a, backgroundImage;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                index = container.styles.backgroundImage.length - 1;
                                _loop_1 = function (backgroundImage) {
                                    var image, url, _a, path, x, y, width, height, pattern, _b, path, x, y, width, height, _c, lineLength, x0, x1, y0, y1, canvas, ctx, gradient_1, pattern, _d, path, left, top_1, width, height, position, x, y, _e, rx, ry, radialGradient_1, midX, midY, f, invF;
                                    return __generator(this, function (_f) {
                                        switch (_f.label) {
                                            case 0:
                                                if (!(backgroundImage.type === CSSImageType.URL)) return [3 /*break*/, 5];
                                                image = void 0;
                                                url = backgroundImage.url;
                                                _f.label = 1;
                                            case 1:
                                                _f.trys.push([1, 3, , 4]);
                                                return [4 /*yield*/, this_1.options.cache.match(url)];
                                            case 2:
                                                image = _f.sent();
                                                return [3 /*break*/, 4];
                                            case 3:
                                                _f.sent();
                                                Logger.getInstance(this_1.options.id).error("Error loading background-image " + url);
                                                return [3 /*break*/, 4];
                                            case 4:
                                                if (image) {
                                                    _a = calculateBackgroundRendering(container, index, [
                                                        image.width,
                                                        image.height,
                                                        image.width / image.height
                                                    ]), path = _a[0], x = _a[1], y = _a[2], width = _a[3], height = _a[4];
                                                    pattern = this_1.ctx.createPattern(this_1.resizeImage(image, width, height), 'repeat');
                                                    this_1.renderRepeat(path, pattern, x, y);
                                                }
                                                return [3 /*break*/, 6];
                                            case 5:
                                                if (isLinearGradient(backgroundImage)) {
                                                    _b = calculateBackgroundRendering(container, index, [null, null, null]), path = _b[0], x = _b[1], y = _b[2], width = _b[3], height = _b[4];
                                                    _c = calculateGradientDirection(backgroundImage.angle, width, height), lineLength = _c[0], x0 = _c[1], x1 = _c[2], y0 = _c[3], y1 = _c[4];
                                                    canvas = document.createElement('canvas');
                                                    canvas.width = width;
                                                    canvas.height = height;
                                                    ctx = canvas.getContext('2d');
                                                    gradient_1 = ctx.createLinearGradient(x0, y0, x1, y1);
                                                    processColorStops(backgroundImage.stops, lineLength).forEach(function (colorStop) {
                                                        return gradient_1.addColorStop(colorStop.stop, asString(colorStop.color));
                                                    });
                                                    ctx.fillStyle = gradient_1;
                                                    ctx.fillRect(0, 0, width, height);
                                                    if (width > 0 && height > 0) {
                                                        pattern = this_1.ctx.createPattern(canvas, 'repeat');
                                                        this_1.renderRepeat(path, pattern, x, y);
                                                    }
                                                }
                                                else if (isRadialGradient(backgroundImage)) {
                                                    _d = calculateBackgroundRendering(container, index, [
                                                        null,
                                                        null,
                                                        null
                                                    ]), path = _d[0], left = _d[1], top_1 = _d[2], width = _d[3], height = _d[4];
                                                    position = backgroundImage.position.length === 0 ? [FIFTY_PERCENT] : backgroundImage.position;
                                                    x = getAbsoluteValue(position[0], width);
                                                    y = getAbsoluteValue(position[position.length - 1], height);
                                                    _e = calculateRadius(backgroundImage, x, y, width, height), rx = _e[0], ry = _e[1];
                                                    if (rx > 0 && rx > 0) {
                                                        radialGradient_1 = this_1.ctx.createRadialGradient(left + x, top_1 + y, 0, left + x, top_1 + y, rx);
                                                        processColorStops(backgroundImage.stops, rx * 2).forEach(function (colorStop) {
                                                            return radialGradient_1.addColorStop(colorStop.stop, asString(colorStop.color));
                                                        });
                                                        this_1.path(path);
                                                        this_1.ctx.fillStyle = radialGradient_1;
                                                        if (rx !== ry) {
                                                            midX = container.bounds.left + 0.5 * container.bounds.width;
                                                            midY = container.bounds.top + 0.5 * container.bounds.height;
                                                            f = ry / rx;
                                                            invF = 1 / f;
                                                            this_1.ctx.save();
                                                            this_1.ctx.translate(midX, midY);
                                                            this_1.ctx.transform(1, 0, 0, f, 0, 0);
                                                            this_1.ctx.translate(-midX, -midY);
                                                            this_1.ctx.fillRect(left, invF * (top_1 - midY) + midY, width, height * invF);
                                                            this_1.ctx.restore();
                                                        }
                                                        else {
                                                            this_1.ctx.fill();
                                                        }
                                                    }
                                                }
                                                _f.label = 6;
                                            case 6:
                                                index--;
                                                return [2 /*return*/];
                                        }
                                    });
                                };
                                this_1 = this;
                                _i = 0, _a = container.styles.backgroundImage.slice(0).reverse();
                                _b.label = 1;
                            case 1:
                                if (!(_i < _a.length)) return [3 /*break*/, 4];
                                backgroundImage = _a[_i];
                                return [5 /*yield**/, _loop_1(backgroundImage)];
                            case 2:
                                _b.sent();
                                _b.label = 3;
                            case 3:
                                _i++;
                                return [3 /*break*/, 1];
                            case 4: return [2 /*return*/];
                        }
                    });
                });
            };
            CanvasRenderer.prototype.renderBorder = function (color, side, curvePoints) {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        this.path(parsePathForBorder(curvePoints, side));
                        this.ctx.fillStyle = asString(color);
                        this.ctx.fill();
                        return [2 /*return*/];
                    });
                });
            };
            CanvasRenderer.prototype.renderNodeBackgroundAndBorders = function (paint) {
                return __awaiter(this, void 0, void 0, function () {
                    var styles, hasBackground, borders, backgroundPaintingArea, side, _i, borders_1, border;
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                this.applyEffects(paint.effects, 2 /* BACKGROUND_BORDERS */);
                                styles = paint.container.styles;
                                hasBackground = !isTransparent(styles.backgroundColor) || styles.backgroundImage.length;
                                borders = [
                                    { style: styles.borderTopStyle, color: styles.borderTopColor },
                                    { style: styles.borderRightStyle, color: styles.borderRightColor },
                                    { style: styles.borderBottomStyle, color: styles.borderBottomColor },
                                    { style: styles.borderLeftStyle, color: styles.borderLeftColor }
                                ];
                                backgroundPaintingArea = calculateBackgroundCurvedPaintingArea(getBackgroundValueForIndex(styles.backgroundClip, 0), paint.curves);
                                if (!(hasBackground || styles.boxShadow.length)) return [3 /*break*/, 2];
                                this.ctx.save();
                                this.path(backgroundPaintingArea);
                                this.ctx.clip();
                                if (!isTransparent(styles.backgroundColor)) {
                                    this.ctx.fillStyle = asString(styles.backgroundColor);
                                    this.ctx.fill();
                                }
                                return [4 /*yield*/, this.renderBackgroundImage(paint.container)];
                            case 1:
                                _a.sent();
                                this.ctx.restore();
                                styles.boxShadow
                                    .slice(0)
                                    .reverse()
                                    .forEach(function (shadow) {
                                    _this.ctx.save();
                                    var borderBoxArea = calculateBorderBoxPath(paint.curves);
                                    var maskOffset = shadow.inset ? 0 : MASK_OFFSET;
                                    var shadowPaintingArea = transformPath(borderBoxArea, -maskOffset + (shadow.inset ? 1 : -1) * shadow.spread.number, (shadow.inset ? 1 : -1) * shadow.spread.number, shadow.spread.number * (shadow.inset ? -2 : 2), shadow.spread.number * (shadow.inset ? -2 : 2));
                                    if (shadow.inset) {
                                        _this.path(borderBoxArea);
                                        _this.ctx.clip();
                                        _this.mask(shadowPaintingArea);
                                    }
                                    else {
                                        _this.mask(borderBoxArea);
                                        _this.ctx.clip();
                                        _this.path(shadowPaintingArea);
                                    }
                                    _this.ctx.shadowOffsetX = shadow.offsetX.number + maskOffset;
                                    _this.ctx.shadowOffsetY = shadow.offsetY.number;
                                    _this.ctx.shadowColor = asString(shadow.color);
                                    _this.ctx.shadowBlur = shadow.blur.number;
                                    _this.ctx.fillStyle = shadow.inset ? asString(shadow.color) : 'rgba(0,0,0,1)';
                                    _this.ctx.fill();
                                    _this.ctx.restore();
                                });
                                _a.label = 2;
                            case 2:
                                side = 0;
                                _i = 0, borders_1 = borders;
                                _a.label = 3;
                            case 3:
                                if (!(_i < borders_1.length)) return [3 /*break*/, 7];
                                border = borders_1[_i];
                                if (!(border.style !== BORDER_STYLE.NONE && !isTransparent(border.color))) return [3 /*break*/, 5];
                                return [4 /*yield*/, this.renderBorder(border.color, side, paint.curves)];
                            case 4:
                                _a.sent();
                                _a.label = 5;
                            case 5:
                                side++;
                                _a.label = 6;
                            case 6:
                                _i++;
                                return [3 /*break*/, 3];
                            case 7: return [2 /*return*/];
                        }
                    });
                });
            };
            CanvasRenderer.prototype.render = function (element) {
                return __awaiter(this, void 0, void 0, function () {
                    var stack;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (this.options.backgroundColor) {
                                    this.ctx.fillStyle = asString(this.options.backgroundColor);
                                    this.ctx.fillRect(this.options.x - this.options.scrollX, this.options.y - this.options.scrollY, this.options.width, this.options.height);
                                }
                                stack = parseStackingContexts(element);
                                return [4 /*yield*/, this.renderStack(stack)];
                            case 1:
                                _a.sent();
                                this.applyEffects([], 2 /* BACKGROUND_BORDERS */);
                                return [2 /*return*/, this.canvas];
                        }
                    });
                });
            };
            return CanvasRenderer;
        }());
        var isTextInputElement = function (container) {
            if (container instanceof TextareaElementContainer) {
                return true;
            }
            else if (container instanceof SelectElementContainer) {
                return true;
            }
            else if (container instanceof InputElementContainer && container.type !== RADIO && container.type !== CHECKBOX) {
                return true;
            }
            return false;
        };
        var calculateBackgroundCurvedPaintingArea = function (clip, curves) {
            switch (clip) {
                case BACKGROUND_CLIP.BORDER_BOX:
                    return calculateBorderBoxPath(curves);
                case BACKGROUND_CLIP.CONTENT_BOX:
                    return calculateContentBoxPath(curves);
                case BACKGROUND_CLIP.PADDING_BOX:
                default:
                    return calculatePaddingBoxPath(curves);
            }
        };
        var canvasTextAlign = function (textAlign) {
            switch (textAlign) {
                case TEXT_ALIGN.CENTER:
                    return 'center';
                case TEXT_ALIGN.RIGHT:
                    return 'right';
                case TEXT_ALIGN.LEFT:
                default:
                    return 'left';
            }
        };

        var ForeignObjectRenderer = /** @class */ (function () {
            function ForeignObjectRenderer(options) {
                this.canvas = options.canvas ? options.canvas : document.createElement('canvas');
                this.ctx = this.canvas.getContext('2d');
                this.options = options;
                this.canvas.width = Math.floor(options.width * options.scale);
                this.canvas.height = Math.floor(options.height * options.scale);
                this.canvas.style.width = options.width + "px";
                this.canvas.style.height = options.height + "px";
                this.ctx.scale(this.options.scale, this.options.scale);
                this.ctx.translate(-options.x + options.scrollX, -options.y + options.scrollY);
                Logger.getInstance(options.id).debug("EXPERIMENTAL ForeignObject renderer initialized (" + options.width + "x" + options.height + " at " + options.x + "," + options.y + ") with scale " + options.scale);
            }
            ForeignObjectRenderer.prototype.render = function (element) {
                return __awaiter(this, void 0, void 0, function () {
                    var svg, img;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                svg = createForeignObjectSVG(Math.max(this.options.windowWidth, this.options.width) * this.options.scale, Math.max(this.options.windowHeight, this.options.height) * this.options.scale, this.options.scrollX * this.options.scale, this.options.scrollY * this.options.scale, element);
                                return [4 /*yield*/, loadSerializedSVG$1(svg)];
                            case 1:
                                img = _a.sent();
                                if (this.options.backgroundColor) {
                                    this.ctx.fillStyle = asString(this.options.backgroundColor);
                                    this.ctx.fillRect(0, 0, this.options.width * this.options.scale, this.options.height * this.options.scale);
                                }
                                this.ctx.drawImage(img, -this.options.x * this.options.scale, -this.options.y * this.options.scale);
                                return [2 /*return*/, this.canvas];
                        }
                    });
                });
            };
            return ForeignObjectRenderer;
        }());
        var loadSerializedSVG$1 = function (svg) {
            return new Promise(function (resolve, reject) {
                var img = new Image();
                img.onload = function () {
                    resolve(img);
                };
                img.onerror = reject;
                img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(new XMLSerializer().serializeToString(svg));
            });
        };

        var _this = undefined;
        var parseColor$1 = function (value) { return color.parse(Parser.create(value).parseComponentValue()); };
        var html2canvas = function (element, options) {
            if (options === void 0) { options = {}; }
            return renderElement(element, options);
        };
        if (typeof window !== 'undefined') {
            CacheStorage.setContext(window);
        }
        var renderElement = function (element, opts) { return __awaiter(_this, void 0, void 0, function () {
            var ownerDocument, defaultView, instanceName, _a, width, height, left, top, defaultResourceOptions, resourceOptions, defaultOptions, options, windowBounds, documentCloner, clonedElement, container, documentBackgroundColor, bodyBackgroundColor, bgColor, defaultBackgroundColor, backgroundColor, renderOptions, canvas, renderer, root, renderer;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        ownerDocument = element.ownerDocument;
                        if (!ownerDocument) {
                            throw new Error("Element is not attached to a Document");
                        }
                        defaultView = ownerDocument.defaultView;
                        if (!defaultView) {
                            throw new Error("Document is not attached to a Window");
                        }
                        instanceName = (Math.round(Math.random() * 1000) + Date.now()).toString(16);
                        _a = isBodyElement(element) || isHTMLElement(element) ? parseDocumentSize(ownerDocument) : parseBounds(element), width = _a.width, height = _a.height, left = _a.left, top = _a.top;
                        defaultResourceOptions = {
                            allowTaint: false,
                            imageTimeout: 15000,
                            proxy: undefined,
                            useCORS: false
                        };
                        resourceOptions = __assign({}, defaultResourceOptions, opts);
                        defaultOptions = {
                            backgroundColor: '#ffffff',
                            cache: opts.cache ? opts.cache : CacheStorage.create(instanceName, resourceOptions),
                            logging: true,
                            removeContainer: true,
                            foreignObjectRendering: false,
                            scale: defaultView.devicePixelRatio || 1,
                            windowWidth: defaultView.innerWidth,
                            windowHeight: defaultView.innerHeight,
                            scrollX: defaultView.pageXOffset,
                            scrollY: defaultView.pageYOffset,
                            x: left,
                            y: top,
                            width: Math.ceil(width),
                            height: Math.ceil(height),
                            id: instanceName
                        };
                        options = __assign({}, defaultOptions, resourceOptions, opts);
                        windowBounds = new Bounds(options.scrollX, options.scrollY, options.windowWidth, options.windowHeight);
                        Logger.create({ id: instanceName, enabled: options.logging });
                        Logger.getInstance(instanceName).debug("Starting document clone");
                        documentCloner = new DocumentCloner(element, {
                            id: instanceName,
                            onclone: options.onclone,
                            ignoreElements: options.ignoreElements,
                            inlineImages: options.foreignObjectRendering,
                            copyStyles: options.foreignObjectRendering
                        });
                        clonedElement = documentCloner.clonedReferenceElement;
                        if (!clonedElement) {
                            return [2 /*return*/, Promise.reject("Unable to find element in cloned iframe")];
                        }
                        return [4 /*yield*/, documentCloner.toIFrame(ownerDocument, windowBounds)];
                    case 1:
                        container = _b.sent();
                        documentBackgroundColor = ownerDocument.documentElement
                            ? parseColor$1(getComputedStyle(ownerDocument.documentElement).backgroundColor)
                            : COLORS.TRANSPARENT;
                        bodyBackgroundColor = ownerDocument.body
                            ? parseColor$1(getComputedStyle(ownerDocument.body).backgroundColor)
                            : COLORS.TRANSPARENT;
                        bgColor = opts.backgroundColor;
                        defaultBackgroundColor = typeof bgColor === 'string' ? parseColor$1(bgColor) : bgColor === null ? COLORS.TRANSPARENT : 0xffffffff;
                        backgroundColor = element === ownerDocument.documentElement
                            ? isTransparent(documentBackgroundColor)
                                ? isTransparent(bodyBackgroundColor)
                                    ? defaultBackgroundColor
                                    : bodyBackgroundColor
                                : documentBackgroundColor
                            : defaultBackgroundColor;
                        renderOptions = {
                            id: instanceName,
                            cache: options.cache,
                            canvas: options.canvas,
                            backgroundColor: backgroundColor,
                            scale: options.scale,
                            x: options.x,
                            y: options.y,
                            scrollX: options.scrollX,
                            scrollY: options.scrollY,
                            width: options.width,
                            height: options.height,
                            windowWidth: options.windowWidth,
                            windowHeight: options.windowHeight
                        };
                        if (!options.foreignObjectRendering) return [3 /*break*/, 3];
                        Logger.getInstance(instanceName).debug("Document cloned, using foreign object rendering");
                        renderer = new ForeignObjectRenderer(renderOptions);
                        return [4 /*yield*/, renderer.render(clonedElement)];
                    case 2:
                        canvas = _b.sent();
                        return [3 /*break*/, 5];
                    case 3:
                        Logger.getInstance(instanceName).debug("Document cloned, using computed rendering");
                        CacheStorage.attachInstance(options.cache);
                        Logger.getInstance(instanceName).debug("Starting DOM parsing");
                        root = parseTree(clonedElement);
                        CacheStorage.detachInstance();
                        if (backgroundColor === root.styles.backgroundColor) {
                            root.styles.backgroundColor = COLORS.TRANSPARENT;
                        }
                        Logger.getInstance(instanceName).debug("Starting renderer");
                        renderer = new CanvasRenderer(renderOptions);
                        return [4 /*yield*/, renderer.render(root)];
                    case 4:
                        canvas = _b.sent();
                        _b.label = 5;
                    case 5:
                        if (options.removeContainer === true) {
                            if (!DocumentCloner.destroy(container)) {
                                Logger.getInstance(instanceName).error("Cannot detach cloned iframe as it is not in the DOM anymore");
                            }
                        }
                        Logger.getInstance(instanceName).debug("Finished rendering");
                        Logger.destroy(instanceName);
                        CacheStorage.destroy(instanceName);
                        return [2 /*return*/, canvas];
                }
            });
        }); };

        return html2canvas;

    }));
    //# sourceMappingURL=html2canvas.js.map
    });

    let GAME;

    // window.addEventListener("beforeunload", ()=> {
    //     // console.log(GAME)
    //     // console.log()
    //     localStorage.setItem("games", JSON.stringify(GAME))
    // })
    // window.addEventListener("load", () => {
    //     console.log(localStorage.getItem("games"))
    // })
    const updateLocalStorage = () => {
        GAME.update_date = Date.now();
        let games = JSON.parse(localStorage.getItem("games"));
        // console.log(games)
        if (!games) games = {};
        games[GAME.id] = GAME;
        // games["test2"] = GAME
        localStorage.setItem("games", JSON.stringify(games));
        printLocalStorageSize();
        setTimeout(()=> {
            let img = document.querySelector("#html-2-canvas");
            html2canvas(img, {
                backgroundColor: null, scale: 2,
            }).then(function(canvas) {
                games[GAME.id].img = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
                localStorage.setItem("games", JSON.stringify(games));
                printLocalStorageSize();
            });
        }, 100);
    };
    const printLocalStorageSize = () => {
        // source: https://stackoverflow.com/a/15720835
        var _lsTotal = 0,
        _xLen, _x;
        for (_x in localStorage) {
            if (!localStorage.hasOwnProperty(_x)) {
                continue;
            }
            _xLen = ((localStorage[_x].length + _x.length) * 2);
            _lsTotal += _xLen;
            console.log(_x.substr(0, 50) + " = " + (_xLen / 1024).toFixed(2) + " KB");
        }    console.log("Total = " + (_lsTotal / 1024).toFixed(2) + " KB");

        
        // console.log(a)
    };

    const loadGame = (id) => {
        console.log(id);
        let loaded_game = JSON.parse(localStorage.getItem("games"))[id];
        console.log(loaded_game);
        GAME = loaded_game;
        // GSI.resetGame(GAME.players[0].id)
        const game = {
            id: GAME.players[0].id,
            letters: [...GAME.board, ...GAME.players[0].rack],
            players: [...GAME.players],
            // players: GAME.players.map(e=>{
            //     return {id: e.id, score: e.score, molangeur: e.molangeur}
            // }),
            round: GAME.round,
        };
        console.log(game);
        setGame(game);
        masterMolangeur([...GAME.board, ...GAME.players[0].rack], (words)=>{
            console.log(words);
            if (words.length !== 0) {
                updateMolangeur(words);
            } else {
                gameOver();
            }
        });
    };
    const newGame = () => {
        // GAME = {
        //     bag: createBag(),
        //     board: [
        //         {id: "111", letter: "A", index: 112, board: true, free: false},
        //         {id: "222", letter: "L", index: 111, board: true, free: false},
        //     ],
        //     players: [{
        //         id: Math.random().toString().slice(2),
        //         rack: [],
        //         score: 0,
        //         molangeur: 0,
        //     }],
        //     round: 0,
        //     type: "solo-duplicate",
        //     id: Math.random().toString().slice(2),
        // }
        GAME = {
            bag: createBag(),
            board: [],
            players: [{
                id: Math.random().toString().slice(2),
                rack: [],
                score: 0,
                molangeur: 0,
            }],
            round: 0,
            type: "solo-duplicate",
            id: Math.random().toString().slice(2),
            update_date: Date.now(),
            create_date: Date.now(),
        };
        resetGame(GAME.players[0].id);
        const drawing_result = drawLetters(GAME.bag, GAME.players[0].rack, GAME.round);
        GAME.players[0].rack = drawing_result.letters;
        GAME.bag = drawing_result.bag;
        const game = {
            board: [...GAME.board],
            rack: [...GAME.players[0].rack],
            players: GAME.players.map(e=>{
                return {id: e.id, score: e.score, molangeur: 0}
            }),
            round: GAME.round,
        };
        updateGame(game);
        // launch master molangeur on the new players game
        masterMolangeur([...GAME.board, ...GAME.players[0].rack], (words)=>{
        // DICO.masterMolangeur(GAME.players[0].rack, (words)=>{
            updateMolangeur(words);
        });
        updateLocalStorage();
    };


    const onWordSubmission = (id, free_letters_on_board, max_score) => {
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
            GAME.players[player_index].molangeur += max_score;
            // update round number
            GAME.round++;
            console.log(GAME);
            console.log(max_score);
            // update player's game
            const game = {
                board: [...GAME.board],
                rack: [...GAME.players[player_index].rack],
                players: GAME.players.map(e=>{
                    return {id: e.id, score: e.score, molangeur: e.molangeur}
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
            
            updateLocalStorage();
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
                // score: 0,
                next_score: 0,
                current_words: null,
                next_words: null,
            },
            players: [],
            round: 0
        });
    };
    const setGame = (game) => {
        console.log(game);
        GameStateStore.init({
            id: game.id,
            letters: game.letters,
            molangeur: {
                // score: game.molangeur,
                next_score: 0,
                current_words: null,
                next_words: null,
            },
            players: game.players,
            round: game.round
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
                // GameStateStore.addLetter(e)
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
                // score:  GSS.molangeur.score,
                next_score: words[0].pts,
                current_words: GSS.molangeur.next_words,
                next_words: words,
                searching: false, 
            });
        } else {
            GameStateStore.setMolangeur({
                // score:  GSS.molangeur.score + GSS.molangeur.next_score,
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

    const setupGame = (id) => {
        if (!id) {
            newGame();
        } else {
            loadGame(id);
        }
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
        onWordSubmission(id, free_letters_on_board, GSS.molangeur.next_score);
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

    const file$a = "src\\game\\LetterLook.svelte";

    function create_fragment$b(ctx) {
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
    			add_location(span0, file$a, 22, 4, 444);
    			attr_dev(span1, "class", "score svelte-f8hqlu");
    			add_location(span1, file$a, 25, 4, 501);
    			attr_dev(div, "class", div_class_value = "" + (null_to_empty("letter " + /*classes*/ ctx[4]) + " svelte-f8hqlu"));
    			attr_dev(div, "style", /*styles*/ ctx[5]);
    			attr_dev(div, "cui", /*id*/ ctx[3]);
    			add_location(div, file$a, 14, 0, 281);
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
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$b($$self, $$props, $$invalidate) {
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

    		init$1(this, options, instance$b, create_fragment$b, safe_not_equal, {
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
    			id: create_fragment$b.name
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

    function create_fragment$a(ctx) {
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
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
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
    		init$1(this, options, instance$a, create_fragment$a, safe_not_equal, { game: 6, letter: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Letter",
    			options,
    			id: create_fragment$a.name
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

    const { Object: Object_1$3 } = globals;
    const file$9 = "src\\game\\Joker.svelte";

    function get_each_context$4(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	child_ctx[12] = i;
    	return child_ctx;
    }

    // (31:8) {#each letters as letter, i}
    function create_each_block$4(ctx) {
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
    		id: create_each_block$4.name,
    		type: "each",
    		source: "(31:8) {#each letters as letter, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
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
    		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
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
    			add_location(div0, file$9, 22, 0, 481);
    			attr_dev(div1, "class", "description svelte-f5oka9");
    			add_location(div1, file$9, 26, 4, 543);
    			attr_dev(div2, "class", "letters svelte-f5oka9");
    			add_location(div2, file$9, 29, 4, 657);
    			attr_dev(button0, "class", "svelte-f5oka9");
    			add_location(button0, file$9, 41, 8, 1000);
    			button1.disabled = button1_disabled_value = /*selected*/ ctx[2].indexOf(true) === -1;
    			attr_dev(button1, "class", "svelte-f5oka9");
    			add_location(button1, file$9, 44, 8, 1076);
    			attr_dev(div3, "class", "actions svelte-f5oka9");
    			add_location(div3, file$9, 40, 4, 969);
    			attr_dev(div4, "class", "container svelte-f5oka9");
    			add_location(div4, file$9, 25, 0, 514);
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
    					const child_ctx = get_each_context$4(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$4(child_ctx);
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
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
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

    	Object_1$3.keys($$props).forEach(key => {
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
    		init$1(this, options, instance$9, create_fragment$9, safe_not_equal, { cancel: 0, validate: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Joker",
    			options,
    			id: create_fragment$9.name
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

    const { Object: Object_1$2 } = globals;
    const file$8 = "src\\game\\BoardOverlay.svelte";

    function get_each_context$3(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[12] = list[i];
    	child_ctx[14] = i;
    	return child_ctx;
    }

    function get_each_context_1$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	child_ctx[14] = i;
    	return child_ctx;
    }

    function get_each_context_2$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[17] = list[i];
    	child_ctx[14] = i;
    	return child_ctx;
    }

    // (78:4) {#if score_info.valid}
    function create_if_block_2$2(ctx) {
    	let div;
    	let span;
    	let t_value = /*score_info*/ ctx[1].score + "";
    	let t;
    	let div_class_value;
    	let div_style_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t = text(t_value);
    			add_location(span, file$8, 79, 12, 2744);

    			attr_dev(div, "class", div_class_value = "" + (null_to_empty(/*score_info*/ ctx[1].vertical
    			? "score vertical"
    			: "score") + " svelte-1mcix80"));

    			attr_dev(div, "style", div_style_value = `--x:${/*score_info*/ ctx[1].score_location.x}; --y:${/*score_info*/ ctx[1].score_location.y}`);
    			add_location(div, file$8, 78, 8, 2587);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*score_info*/ 2 && t_value !== (t_value = /*score_info*/ ctx[1].score + "")) set_data_dev(t, t_value);

    			if (dirty & /*score_info*/ 2 && div_class_value !== (div_class_value = "" + (null_to_empty(/*score_info*/ ctx[1].vertical
    			? "score vertical"
    			: "score") + " svelte-1mcix80"))) {
    				attr_dev(div, "class", div_class_value);
    			}

    			if (dirty & /*score_info*/ 2 && div_style_value !== (div_style_value = `--x:${/*score_info*/ ctx[1].score_location.x}; --y:${/*score_info*/ ctx[1].score_location.y}`)) {
    				attr_dev(div, "style", div_style_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$2.name,
    		type: "if",
    		source: "(78:4) {#if score_info.valid}",
    		ctx
    	});

    	return block;
    }

    // (85:4) {#if game_over}
    function create_if_block_1$3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Partie terminé";
    			attr_dev(div, "class", "gameover svelte-1mcix80");
    			add_location(div, file$8, 85, 8, 2865);
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
    		id: create_if_block_1$3.name,
    		type: "if",
    		source: "(85:4) {#if game_over}",
    		ctx
    	});

    	return block;
    }

    // (92:0) {#if joker_picker}
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
    		source: "(92:0) {#if joker_picker}",
    		ctx
    	});

    	return block;
    }

    // (96:0) {#each temp_letters as ltr, i}
    function create_each_block_2$1(ctx) {
    	let letterlook;
    	let current;

    	letterlook = new LetterLook({
    			props: {
    				letter: /*ltr*/ ctx[17].letter,
    				value: "",
    				id: /*i*/ ctx[14],
    				classes: "board temp",
    				styles: `--x:${/*game*/ ctx[0].getBoardXY(/*ltr*/ ctx[17].index).x}; --y:${/*game*/ ctx[0].getBoardXY(/*ltr*/ ctx[17].index).y};`
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
    			if (dirty & /*temp_letters*/ 4) letterlook_changes.letter = /*ltr*/ ctx[17].letter;
    			if (dirty & /*game, temp_letters*/ 5) letterlook_changes.styles = `--x:${/*game*/ ctx[0].getBoardXY(/*ltr*/ ctx[17].index).x}; --y:${/*game*/ ctx[0].getBoardXY(/*ltr*/ ctx[17].index).y};`;
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
    		source: "(96:0) {#each temp_letters as ltr, i}",
    		ctx
    	});

    	return block;
    }

    // (106:0) {#each row_names as rn, i}
    function create_each_block_1$1(ctx) {
    	let div;
    	let t_value = /*rn*/ ctx[15] + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			attr_dev(div, "class", "row-col-name svelte-1mcix80");
    			attr_dev(div, "style", `--x:${-1.125}; --y:${/*i*/ ctx[14] + 0.25};text-align: right;`);
    			add_location(div, file$8, 106, 5, 3338);
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
    		source: "(106:0) {#each row_names as rn, i}",
    		ctx
    	});

    	return block;
    }

    // (111:0) {#each col_names as cn, i}
    function create_each_block$3(ctx) {
    	let div;
    	let t0_value = /*cn*/ ctx[12] + "";
    	let t0;
    	let t1;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t0 = text(t0_value);
    			t1 = space();
    			attr_dev(div, "class", "row-col-name svelte-1mcix80");
    			attr_dev(div, "style", `--x:${/*i*/ ctx[14]}; --y:${-0.5};text-align: center;`);
    			add_location(div, file$8, 111, 5, 3494);
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
    		id: create_each_block$3.name,
    		type: "each",
    		source: "(111:0) {#each col_names as cn, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$8(ctx) {
    	let div;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let each2_anchor;
    	let current;
    	let if_block0 = /*score_info*/ ctx[1].valid && create_if_block_2$2(ctx);
    	let if_block1 = /*game_over*/ ctx[3] && create_if_block_1$3(ctx);
    	let if_block2 = /*joker_picker*/ ctx[4] && create_if_block$4(ctx);
    	let each_value_2 = /*temp_letters*/ ctx[2];
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
    		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
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
    			add_location(div, file$8, 76, 0, 2527);
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
    			if (/*score_info*/ ctx[1].valid) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_2$2(ctx);
    					if_block0.c();
    					if_block0.m(div, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (/*game_over*/ ctx[3]) {
    				if (if_block1) ; else {
    					if_block1 = create_if_block_1$3(ctx);
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (/*joker_picker*/ ctx[4]) {
    				if (if_block2) {
    					if_block2.p(ctx, dirty);

    					if (dirty & /*joker_picker*/ 16) {
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

    			if (dirty & /*temp_letters, game*/ 5) {
    				each_value_2 = /*temp_letters*/ ctx[2];
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
    					const child_ctx = get_each_context$3(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$3(child_ctx);
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
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let score_info;
    	let temp_letters;
    	let game_over;
    	let joker_picker;
    	let $GameStateStore;
    	let $GameGimmickStore;
    	validate_store(GameStateStore, "GameStateStore");
    	component_subscribe($$self, GameStateStore, $$value => $$invalidate(9, $GameStateStore = $$value));
    	validate_store(GameGimmickStore, "GameGimmickStore");
    	component_subscribe($$self, GameGimmickStore, $$value => $$invalidate(10, $GameGimmickStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("BoardOverlay", slots, []);
    	let { game } = $$props;
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

    	// dealing with temp letters
    	// $: { 
    	//     temp_letters = $GameGimmickStore.temp_letters
    	// }
    	// dealing with row and column names
    	const row_names = Array(15).fill(0).map((e, i) => i + 1);

    	const col_names = Object.keys(LETTERS).filter(e => e !== "_").filter((e, i) => i < 15);
    	const writable_props = ["game"];

    	Object_1$2.keys($$props).forEach(key => {
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
    		score_info,
    		temp_letters,
    		game_over,
    		joker_picker,
    		$GameStateStore,
    		$GameGimmickStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("game" in $$props) $$invalidate(0, game = $$props.game);
    		if ("score_info" in $$props) $$invalidate(1, score_info = $$props.score_info);
    		if ("temp_letters" in $$props) $$invalidate(2, temp_letters = $$props.temp_letters);
    		if ("game_over" in $$props) $$invalidate(3, game_over = $$props.game_over);
    		if ("joker_picker" in $$props) $$invalidate(4, joker_picker = $$props.joker_picker);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$GameStateStore, game, $GameGimmickStore*/ 1537) {
    			{
    				if ($GameStateStore) {
    					// dealing with score update
    					let evaluation = $GameStateStore.evaluation;

    					if (evaluation) {
    						$$invalidate(1, score_info = {
    							valid: evaluation.is_word_valid,
    							score: evaluation.total_score,
    							score_location: game.getBoardXY(evaluation.last_letter_index),
    							vertical: evaluation.full_words[evaluation.main_word_index].vertical
    						});
    					} else {
    						$$invalidate(1, score_info = { ...score_info_default });
    					}

    					// dealing with joker picker
    					$$invalidate(4, joker_picker = $GameStateStore.jocker_picker);

    					// dealing with temporary letters
    					$$invalidate(2, temp_letters = $GameGimmickStore.temp_letters);

    					// dealing with game over
    					$$invalidate(3, game_over = $GameStateStore.game_over);
    				}
    			}
    		}
    	};

    	$$invalidate(1, score_info = { ...score_info_default });
    	$$invalidate(2, temp_letters = []);
    	$$invalidate(3, game_over = false);
    	$$invalidate(4, joker_picker = false);

    	return [
    		game,
    		score_info,
    		temp_letters,
    		game_over,
    		joker_picker,
    		cancelJoker,
    		validateJoker,
    		row_names,
    		col_names,
    		$GameStateStore,
    		$GameGimmickStore
    	];
    }

    class BoardOverlay extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$8, create_fragment$8, safe_not_equal, { game: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "BoardOverlay",
    			options,
    			id: create_fragment$8.name
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
    const file$7 = "src\\game\\Game.svelte";

    function get_each_context$2(ctx, list, i) {
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
    	let span;
    	let t0;
    	let t1;
    	let each_value_4 = /*each_value_4*/ ctx[27];
    	let i = /*i*/ ctx[26];
    	const assign_div = () => /*div_binding*/ ctx[9](div, each_value_4, i);
    	const unassign_div = () => /*div_binding*/ ctx[9](null, each_value_4, i);

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t0 = text(/*i*/ ctx[26]);
    			t1 = space();
    			set_style(span, "font-size", "0.7em");
    			add_location(span, file$7, 80, 20, 2677);
    			attr_dev(div, "class", "board-cell svelte-d5xu96");
    			attr_dev(div, "style", `--x:${/*getBoardXY*/ ctx[6](/*i*/ ctx[26]).x};--y:${/*getBoardXY*/ ctx[6](/*i*/ ctx[26]).y};`);
    			attr_dev(div, "cid", /*i*/ ctx[26]);
    			add_location(div, file$7, 79, 16, 2552);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t0);
    			append_dev(div, t1);
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
    			add_location(div0, file$7, 87, 16, 2953);
    			attr_dev(div1, "class", "rack-cell svelte-d5xu96");
    			attr_dev(div1, "style", `--pos:${/*getRackPos*/ ctx[7](/*i*/ ctx[26])};`);
    			attr_dev(div1, "cid", /*i*/ ctx[26]);
    			add_location(div1, file$7, 86, 12, 2855);
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
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
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
    			add_location(div0, file$7, 94, 12, 3110);
    			attr_dev(div1, "class", "board-letters-fixed");
    			add_location(div1, file$7, 99, 12, 3355);
    			attr_dev(div2, "class", "rack-letters");
    			add_location(div2, file$7, 104, 12, 3602);
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
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
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
    function create_each_block$2(ctx) {
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
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(106:16) {#each $GameStateStore.letters.filter(e=>!e.board) as ltr}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
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
    			add_location(div0, file$7, 76, 8, 2426);
    			attr_dev(div1, "class", "rack svelte-d5xu96");
    			add_location(div1, file$7, 84, 8, 2789);
    			attr_dev(div2, "class", "game svelte-d5xu96");
    			add_location(div2, file$7, 75, 4, 2381);
    			attr_dev(div3, "class", "container svelte-d5xu96");
    			attr_dev(div3, "id", "html-2-canvas");
    			attr_dev(div3, "style", div3_style_value = `--REF-SIZE: ${/*width*/ ctx[0] * 15 / 16}px;--S: ${/*width*/ ctx[0] / 16}px;`);
    			add_location(div3, file$7, 74, 0, 2250);
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
    		id: create_fragment$7.name,
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

    function instance$7($$self, $$props, $$invalidate) {
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

    class Game$1 extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$7, create_fragment$7, safe_not_equal, { width: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Game",
    			options,
    			id: create_fragment$7.name
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

    const { Object: Object_1$1, console: console_1$2 } = globals;
    const file$6 = "src\\game\\MasterMolangeur.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[10] = list[i];
    	child_ctx[12] = i;
    	return child_ctx;
    }

    // (54:4) {#if has_something_to_show}
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
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
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
    			add_location(div0, file$6, 54, 8, 1930);
    			attr_dev(div1, "class", "best-words-list svelte-vhdfrg");
    			add_location(div1, file$6, 57, 8, 2075);
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
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
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
    		source: "(54:4) {#if has_something_to_show}",
    		ctx
    	});

    	return block;
    }

    // (70:20) {:else}
    function create_else_block$3(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "pos-h svelte-vhdfrg");
    			add_location(div, file$6, 70, 24, 2610);
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
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(70:20) {:else}",
    		ctx
    	});

    	return block;
    }

    // (68:20) {#if word.dir==="V"}
    function create_if_block_1$2(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "pos-v svelte-vhdfrg");
    			add_location(div, file$6, 68, 24, 2530);
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
    		source: "(68:20) {#if word.dir===\\\"V\\\"}",
    		ctx
    	});

    	return block;
    }

    // (59:12) {#each words_list as word, i}
    function create_each_block$1(ctx) {
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
    		if (/*word*/ ctx[10].dir === "V") return create_if_block_1$2;
    		return create_else_block$3;
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
    			add_location(span0, file$6, 72, 20, 2684);
    			attr_dev(span1, "class", "wrd svelte-vhdfrg");
    			add_location(span1, file$6, 75, 20, 2809);
    			attr_dev(span2, "class", "pts svelte-vhdfrg");
    			add_location(span2, file$6, 78, 20, 2915);
    			attr_dev(div, "class", "word svelte-vhdfrg");
    			attr_dev(div, "tabindex", "0");
    			attr_dev(div, "selected", div_selected_value = /*i*/ ctx[12] === /*selected*/ ctx[1] ? "true" : "false");
    			add_location(div, file$6, 59, 16, 2165);
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
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(59:12) {#each words_list as word, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let div;
    	let if_block = /*has_something_to_show*/ ctx[2] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "container svelte-vhdfrg");
    			add_location(div, file$6, 52, 0, 1864);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*has_something_to_show*/ ctx[2]) {
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
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let words_list;
    	let selected;
    	let has_something_to_show;
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

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<MasterMolangeur> was created with unknown prop '${key}'`);
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
    		selected,
    		has_something_to_show,
    		$GameStateStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("words_list" in $$props) $$invalidate(0, words_list = $$props.words_list);
    		if ("selected" in $$props) $$invalidate(1, selected = $$props.selected);
    		if ("has_something_to_show" in $$props) $$invalidate(2, has_something_to_show = $$props.has_something_to_show);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$GameStateStore*/ 64) {
    			{
    				if ($GameStateStore) {
    					console.log($GameStateStore.molangeur);
    					$$invalidate(0, words_list = $GameStateStore.molangeur.current_words);

    					// console.log($GameStateStore.molangeur.next_words)
    					// first_round = $GameStateStore.round === 0
    					$$invalidate(2, has_something_to_show = $GameStateStore.molangeur.current_words !== null);
    				}
    			}
    		}
    	};

    	$$invalidate(0, words_list = []);
    	$$invalidate(1, selected = -1);
    	$$invalidate(2, has_something_to_show = true);

    	return [
    		words_list,
    		selected,
    		has_something_to_show,
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
    		init$1(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "MasterMolangeur",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src\game\Buttons.svelte generated by Svelte v3.38.2 */

    const file$5 = "src\\game\\Buttons.svelte";

    // (50:8) {:else}
    function create_else_block_1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Mot non valide";
    			attr_dev(div, "class", "result invalid svelte-57msys");
    			add_location(div, file$5, 50, 12, 1671);
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
    		source: "(50:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (46:41) 
    function create_if_block_2$1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "Mot valide";
    			attr_dev(div, "class", "result valid svelte-57msys");
    			add_location(div, file$5, 46, 12, 1566);
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
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(46:41) ",
    		ctx
    	});

    	return block;
    }

    // (44:8) {#if dictionnary_valid_word===null }
    function create_if_block_1$1(ctx) {
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
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(44:8) {#if dictionnary_valid_word===null }",
    		ctx
    	});

    	return block;
    }

    // (62:4) {:else}
    function create_else_block$2(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Jouer";
    			button.disabled = true;
    			attr_dev(button, "class", "svelte-57msys");
    			add_location(button, file$5, 62, 8, 2042);
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
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(62:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (60:4) {#if word_submission_possible}
    function create_if_block$1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Jouer";
    			attr_dev(button, "class", "svelte-57msys");
    			add_location(button, file$5, 60, 8, 1981);
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
    		source: "(60:4) {#if word_submission_possible}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
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
    		if (/*dictionnary_valid_word*/ ctx[0] === null) return create_if_block_1$1;
    		if (/*dictionnary_valid_word*/ ctx[0]) return create_if_block_2$1;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*word_submission_possible*/ ctx[1]) return create_if_block$1;
    		return create_else_block$2;
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
    			add_location(input, file$5, 42, 8, 1265);
    			attr_dev(div0, "class", "dico");
    			add_location(div0, file$5, 41, 4, 1237);
    			attr_dev(button0, "class", "svelte-57msys");
    			add_location(button0, file$5, 57, 4, 1800);
    			attr_dev(button1, "class", "svelte-57msys");
    			add_location(button1, file$5, 58, 4, 1863);
    			attr_dev(div1, "class", "action svelte-57msys");
    			add_location(div1, file$5, 40, 0, 1210);
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
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
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
    				if ($GameStateStore) {
    					if ($GameStateStore.evaluation && $GameStateStore.evaluation.is_position_valid && $GameStateStore.evaluation.is_word_valid) {
    						$$invalidate(1, word_submission_possible = true);
    					} else {
    						$$invalidate(1, word_submission_possible = false);
    					}
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
    		init$1(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Buttons",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src\game\Info.svelte generated by Svelte v3.38.2 */

    const { console: console_1$1 } = globals;
    const file$4 = "src\\game\\Info.svelte";

    function create_fragment$4(ctx) {
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
    			add_location(span0, file$4, 41, 11, 1292);
    			add_location(div0, file$4, 40, 0, 1274);
    			attr_dev(span1, "class", "value svelte-3utdym");
    			add_location(span1, file$4, 44, 31, 1374);
    			add_location(div1, file$4, 43, 0, 1336);
    			attr_dev(span2, "class", "value svelte-3utdym");
    			add_location(span2, file$4, 47, 38, 1473);
    			add_location(div2, file$4, 46, 0, 1428);
    			attr_dev(span3, "class", "value svelte-3utdym");
    			add_location(span3, file$4, 50, 29, 1558);
    			add_location(div3, file$4, 49, 0, 1522);
    			attr_dev(div4, "class", "score svelte-3utdym");
    			add_location(div4, file$4, 39, 0, 1253);
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let id;
    	let score;
    	let molangeur_score;
    	let difference;
    	let molangeur_best;
    	let $GameStateStore;
    	validate_store(GameStateStore, "GameStateStore");
    	component_subscribe($$self, GameStateStore, $$value => $$invalidate(5, $GameStateStore = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Info", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Info> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		GameStateStore,
    		id,
    		score,
    		molangeur_score,
    		difference,
    		molangeur_best,
    		$GameStateStore
    	});

    	$$self.$inject_state = $$props => {
    		if ("id" in $$props) $$invalidate(4, id = $$props.id);
    		if ("score" in $$props) $$invalidate(0, score = $$props.score);
    		if ("molangeur_score" in $$props) $$invalidate(1, molangeur_score = $$props.molangeur_score);
    		if ("difference" in $$props) $$invalidate(2, difference = $$props.difference);
    		if ("molangeur_best" in $$props) $$invalidate(3, molangeur_best = $$props.molangeur_best);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$GameStateStore, id, molangeur_score, score*/ 51) {
    			{
    				if ($GameStateStore) {
    					$$invalidate(4, id = $GameStateStore.id);
    					let player = $GameStateStore.players.filter(e => e.id === id)[0];
    					let molangeur = $GameStateStore.molangeur;
    					console.log(player);
    					console.log(molangeur);
    					$$invalidate(0, score = player ? player.score : 0);

    					// molangeur_score = molangeur.score
    					$$invalidate(1, molangeur_score = player ? player.molangeur : 0);

    					$$invalidate(3, molangeur_best = molangeur ? molangeur.next_score : 0);
    					$$invalidate(2, difference = molangeur_score - score);
    				}
    			}
    		}
    	};

    	$$invalidate(4, id = null);
    	$$invalidate(0, score = 0);
    	$$invalidate(1, molangeur_score = 0);
    	$$invalidate(2, difference = 0);
    	$$invalidate(3, molangeur_best = 0);
    	return [score, molangeur_score, difference, molangeur_best, id, $GameStateStore];
    }

    class Info extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Info",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src\game\GamePage.svelte generated by Svelte v3.38.2 */
    const file$3 = "src\\game\\GamePage.svelte";

    function create_fragment$3(ctx) {
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

    	game = new Game$1({
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
    			add_location(div0, file$3, 30, 8, 826);
    			attr_dev(div1, "class", "game svelte-wpuk4j");
    			add_location(div1, file$3, 31, 8, 875);
    			attr_dev(div2, "class", "extra btns svelte-wpuk4j");
    			add_location(div2, file$3, 32, 8, 952);
    			attr_dev(div3, "class", "mstm extra svelte-wpuk4j");
    			add_location(div3, file$3, 33, 8, 1003);
    			attr_dev(div4, "class", "container svelte-wpuk4j");
    			attr_dev(div4, "style", div4_style_value = `--padd: ${/*padding*/ ctx[2]}px;`);
    			add_location(div4, file$3, 29, 0, 761);
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
    			/*div1_binding*/ ctx[4](div1);
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
    			/*div1_binding*/ ctx[4](null);
    			destroy_component(buttons);
    			destroy_component(mastermolangeur);
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
    	let padding;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("GamePage", slots, []);
    	let { id } = $$props;
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

    	setupGame(id);
    	const writable_props = ["id"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<GamePage> was created with unknown prop '${key}'`);
    	});

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			container = $$value;
    			$$invalidate(1, container);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("id" in $$props) $$invalidate(3, id = $$props.id);
    	};

    	$$self.$capture_state = () => ({
    		id,
    		setupGame,
    		Game: Game$1,
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
    		if ("id" in $$props) $$invalidate(3, id = $$props.id);
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

    	return [width, container, padding, id, div1_binding];
    }

    class GamePage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$3, create_fragment$3, safe_not_equal, { id: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "GamePage",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*id*/ ctx[3] === undefined && !("id" in props)) {
    			console.warn("<GamePage> was created without expected prop 'id'");
    		}
    	}

    	get id() {
    		throw new Error("<GamePage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set id(value) {
    		throw new Error("<GamePage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\welcom\Game.svelte generated by Svelte v3.38.2 */

    const file$2 = "src\\welcom\\Game.svelte";

    function create_fragment$2(ctx) {
    	let div10;
    	let div2;
    	let div0;
    	let t0;
    	let span0;
    	let t1_value = /*getDate*/ ctx[2](/*game*/ ctx[0].create_date) + "";
    	let t1;
    	let t2;
    	let span1;
    	let t3_value = /*getTime*/ ctx[3](/*game*/ ctx[0].create_date) + "";
    	let t3;
    	let t4;
    	let div1;
    	let span2;
    	let t5_value = `(id #${/*game*/ ctx[0].id})` + "";
    	let t5;
    	let t6;
    	let div9;
    	let img;
    	let img_src_value;
    	let t7;
    	let div8;
    	let div3;
    	let t8;
    	let span3;
    	let t9_value = /*game*/ ctx[0].players[0].score + "";
    	let t9;
    	let t10;
    	let div4;
    	let t11;
    	let span4;
    	let t12_value = /*game*/ ctx[0].players[0].molangeur + "";
    	let t12;
    	let t13;
    	let div5;
    	let t14;
    	let span5;
    	let t15_value = /*game*/ ctx[0].players[0].molangeur - /*game*/ ctx[0].players[0].score + "";
    	let t15;
    	let t16;
    	let div6;
    	let t17;
    	let span6;
    	let t18_value = /*game*/ ctx[0].round + "";
    	let t18;
    	let t19;
    	let div7;
    	let t20;
    	let span7;
    	let t21_value = /*getDate*/ ctx[2](/*game*/ ctx[0].update_date) + "";
    	let t21;
    	let t22;
    	let span8;
    	let t23_value = /*getTime*/ ctx[3](/*game*/ ctx[0].update_date) + "";
    	let t23;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div10 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			t0 = text("Partie créée le ");
    			span0 = element("span");
    			t1 = text(t1_value);
    			t2 = text("\r\n           à ");
    			span1 = element("span");
    			t3 = text(t3_value);
    			t4 = space();
    			div1 = element("div");
    			span2 = element("span");
    			t5 = text(t5_value);
    			t6 = space();
    			div9 = element("div");
    			img = element("img");
    			t7 = space();
    			div8 = element("div");
    			div3 = element("div");
    			t8 = text("Ton score: ");
    			span3 = element("span");
    			t9 = text(t9_value);
    			t10 = space();
    			div4 = element("div");
    			t11 = text("Score de Maître MoLangeur: ");
    			span4 = element("span");
    			t12 = text(t12_value);
    			t13 = space();
    			div5 = element("div");
    			t14 = text("Différence de score: ");
    			span5 = element("span");
    			t15 = text(t15_value);
    			t16 = space();
    			div6 = element("div");
    			t17 = text("Nombre de tours faits: ");
    			span6 = element("span");
    			t18 = text(t18_value);
    			t19 = space();
    			div7 = element("div");
    			t20 = text("Dernière modification le ");
    			span7 = element("span");
    			t21 = text(t21_value);
    			t22 = text("\r\n                à ");
    			span8 = element("span");
    			t23 = text(t23_value);
    			attr_dev(span0, "class", "date svelte-foqevo");
    			add_location(span0, file$2, 17, 42, 405);
    			attr_dev(span1, "class", "date svelte-foqevo");
    			add_location(span1, file$2, 18, 13, 473);
    			attr_dev(div0, "class", "main");
    			add_location(div0, file$2, 17, 8, 371);
    			attr_dev(span2, "class", "id svelte-foqevo");
    			add_location(span2, file$2, 20, 11, 578);
    			attr_dev(div1, "class", "secondary");
    			add_location(div1, file$2, 19, 8, 542);
    			attr_dev(div2, "class", "title svelte-foqevo");
    			add_location(div2, file$2, 16, 4, 342);
    			if (img.src !== (img_src_value = /*game*/ ctx[0].img)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "width", "200px");
    			add_location(img, file$2, 26, 11, 720);
    			attr_dev(span3, "class", "bold svelte-foqevo");
    			add_location(span3, file$2, 28, 31, 825);
    			add_location(div3, file$2, 28, 15, 809);
    			attr_dev(span4, "class", "bold svelte-foqevo");
    			add_location(span4, file$2, 29, 47, 929);
    			add_location(div4, file$2, 29, 15, 897);
    			attr_dev(span5, "class", "bold svelte-foqevo");
    			add_location(span5, file$2, 30, 41, 1031);
    			add_location(div5, file$2, 30, 15, 1005);
    			attr_dev(span6, "class", "bold svelte-foqevo");
    			add_location(span6, file$2, 31, 43, 1159);
    			add_location(div6, file$2, 31, 15, 1131);
    			attr_dev(span7, "class", "date svelte-foqevo");
    			add_location(span7, file$2, 32, 45, 1250);
    			attr_dev(span8, "class", "date svelte-foqevo");
    			add_location(span8, file$2, 33, 18, 1323);
    			add_location(div7, file$2, 32, 15, 1220);
    			attr_dev(div8, "class", "info");
    			add_location(div8, file$2, 27, 11, 774);
    			attr_dev(div9, "class", "content svelte-foqevo");
    			add_location(div9, file$2, 25, 4, 686);
    			attr_dev(div10, "class", "game svelte-foqevo");
    			add_location(div10, file$2, 15, 0, 286);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div10, anchor);
    			append_dev(div10, div2);
    			append_dev(div2, div0);
    			append_dev(div0, t0);
    			append_dev(div0, span0);
    			append_dev(span0, t1);
    			append_dev(div0, t2);
    			append_dev(div0, span1);
    			append_dev(span1, t3);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			append_dev(div1, span2);
    			append_dev(span2, t5);
    			append_dev(div10, t6);
    			append_dev(div10, div9);
    			append_dev(div9, img);
    			append_dev(div9, t7);
    			append_dev(div9, div8);
    			append_dev(div8, div3);
    			append_dev(div3, t8);
    			append_dev(div3, span3);
    			append_dev(span3, t9);
    			append_dev(div8, t10);
    			append_dev(div8, div4);
    			append_dev(div4, t11);
    			append_dev(div4, span4);
    			append_dev(span4, t12);
    			append_dev(div8, t13);
    			append_dev(div8, div5);
    			append_dev(div5, t14);
    			append_dev(div5, span5);
    			append_dev(span5, t15);
    			append_dev(div8, t16);
    			append_dev(div8, div6);
    			append_dev(div6, t17);
    			append_dev(div6, span6);
    			append_dev(span6, t18);
    			append_dev(div8, t19);
    			append_dev(div8, div7);
    			append_dev(div7, t20);
    			append_dev(div7, span7);
    			append_dev(span7, t21);
    			append_dev(div7, t22);
    			append_dev(div7, span8);
    			append_dev(span8, t23);

    			if (!mounted) {
    				dispose = listen_dev(div10, "click", /*click_handler*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*game*/ 1 && t1_value !== (t1_value = /*getDate*/ ctx[2](/*game*/ ctx[0].create_date) + "")) set_data_dev(t1, t1_value);
    			if (dirty & /*game*/ 1 && t3_value !== (t3_value = /*getTime*/ ctx[3](/*game*/ ctx[0].create_date) + "")) set_data_dev(t3, t3_value);
    			if (dirty & /*game*/ 1 && t5_value !== (t5_value = `(id #${/*game*/ ctx[0].id})` + "")) set_data_dev(t5, t5_value);

    			if (dirty & /*game*/ 1 && img.src !== (img_src_value = /*game*/ ctx[0].img)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*game*/ 1 && t9_value !== (t9_value = /*game*/ ctx[0].players[0].score + "")) set_data_dev(t9, t9_value);
    			if (dirty & /*game*/ 1 && t12_value !== (t12_value = /*game*/ ctx[0].players[0].molangeur + "")) set_data_dev(t12, t12_value);
    			if (dirty & /*game*/ 1 && t15_value !== (t15_value = /*game*/ ctx[0].players[0].molangeur - /*game*/ ctx[0].players[0].score + "")) set_data_dev(t15, t15_value);
    			if (dirty & /*game*/ 1 && t18_value !== (t18_value = /*game*/ ctx[0].round + "")) set_data_dev(t18, t18_value);
    			if (dirty & /*game*/ 1 && t21_value !== (t21_value = /*getDate*/ ctx[2](/*game*/ ctx[0].update_date) + "")) set_data_dev(t21, t21_value);
    			if (dirty & /*game*/ 1 && t23_value !== (t23_value = /*getTime*/ ctx[3](/*game*/ ctx[0].update_date) + "")) set_data_dev(t23, t23_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div10);
    			mounted = false;
    			dispose();
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Game", slots, []);
    	let { game } = $$props;
    	let { onclick } = $$props;

    	const getDate = x => {
    		let d = new Date(x);
    		return d.toLocaleDateString();
    	};

    	const getTime = x => {
    		let d = new Date(x);
    		return d.toLocaleTimeString();
    	};

    	const writable_props = ["game", "onclick"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Game> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => onclick(game.id);

    	$$self.$$set = $$props => {
    		if ("game" in $$props) $$invalidate(0, game = $$props.game);
    		if ("onclick" in $$props) $$invalidate(1, onclick = $$props.onclick);
    	};

    	$$self.$capture_state = () => ({ game, onclick, getDate, getTime });

    	$$self.$inject_state = $$props => {
    		if ("game" in $$props) $$invalidate(0, game = $$props.game);
    		if ("onclick" in $$props) $$invalidate(1, onclick = $$props.onclick);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [game, onclick, getDate, getTime, click_handler];
    }

    class Game extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$2, create_fragment$2, safe_not_equal, { game: 0, onclick: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Game",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*game*/ ctx[0] === undefined && !("game" in props)) {
    			console.warn("<Game> was created without expected prop 'game'");
    		}

    		if (/*onclick*/ ctx[1] === undefined && !("onclick" in props)) {
    			console.warn("<Game> was created without expected prop 'onclick'");
    		}
    	}

    	get game() {
    		throw new Error("<Game>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set game(value) {
    		throw new Error("<Game>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onclick() {
    		throw new Error("<Game>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onclick(value) {
    		throw new Error("<Game>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\welcom\WelcomPage.svelte generated by Svelte v3.38.2 */

    const { Object: Object_1, console: console_1 } = globals;
    const file$1 = "src\\welcom\\WelcomPage.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (32:4) {:else}
    function create_else_block$1(ctx) {
    	let span;

    	const block = {
    		c: function create() {
    			span = element("span");
    			span.textContent = "Aucune partie... Crée une partie ci-dessus pour commencer à jouer.\r\n         ";
    			attr_dev(span, "class", "nogame svelte-t5w159");
    			add_location(span, file$1, 32, 9, 954);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, span, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(32:4) {:else}",
    		ctx
    	});

    	return block;
    }

    // (30:4) {#each game_list as game}
    function create_each_block(ctx) {
    	let game;
    	let current;

    	game = new Game({
    			props: {
    				game: /*game*/ ctx[4],
    				onclick: /*launchGame*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(game.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(game, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const game_changes = {};
    			if (dirty & /*launchGame*/ 1) game_changes.onclick = /*launchGame*/ ctx[0];
    			game.$set(game_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(game.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(game.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(game, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(30:4) {#each game_list as game}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div4;
    	let div0;
    	let t1;
    	let div1;
    	let button0;
    	let t3;
    	let button1;
    	let t5;
    	let div3;
    	let div2;
    	let t7;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*game_list*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block$1(ctx);
    	}

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div0 = element("div");
    			div0.textContent = "Bienvenue dans MoLangeur!";
    			t1 = space();
    			div1 = element("div");
    			button0 = element("button");
    			button0.textContent = "Nouvelle Partie Solo (Duplicate)";
    			t3 = space();
    			button1 = element("button");
    			button1.textContent = "Nouvelle Partie Solo (Classique)";
    			t5 = space();
    			div3 = element("div");
    			div2 = element("div");
    			div2.textContent = "Parties existantes (clique sur un partie pour continuer à jouer):";
    			t7 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (each_1_else) {
    				each_1_else.c();
    			}

    			attr_dev(div0, "class", "intro svelte-t5w159");
    			add_location(div0, file$1, 13, 4, 371);
    			attr_dev(button0, "class", "svelte-t5w159");
    			add_location(button0, file$1, 17, 8, 476);
    			button1.disabled = true;
    			attr_dev(button1, "class", "svelte-t5w159");
    			add_location(button1, file$1, 20, 8, 587);
    			attr_dev(div1, "class", "new-games svelte-t5w159");
    			add_location(div1, file$1, 16, 4, 443);
    			attr_dev(div2, "class", "game-list-header svelte-t5w159");
    			add_location(div2, file$1, 26, 8, 722);
    			attr_dev(div3, "class", "game-list");
    			add_location(div3, file$1, 25, 4, 689);
    			attr_dev(div4, "class", "container svelte-t5w159");
    			add_location(div4, file$1, 12, 0, 342);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div0);
    			append_dev(div4, t1);
    			append_dev(div4, div1);
    			append_dev(div1, button0);
    			append_dev(div1, t3);
    			append_dev(div1, button1);
    			append_dev(div4, t5);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div3, t7);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div3, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(div3, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(
    					button0,
    					"click",
    					function () {
    						if (is_function(/*launchGame*/ ctx[0](null))) /*launchGame*/ ctx[0](null).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*game_list, launchGame*/ 3) {
    				each_value = /*game_list*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div3, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();

    				if (each_value.length) {
    					if (each_1_else) {
    						each_1_else.d(1);
    						each_1_else = null;
    					}
    				} else if (!each_1_else) {
    					each_1_else = create_else_block$1(ctx);
    					each_1_else.c();
    					each_1_else.m(div3, null);
    				}
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
    			if (detaching) detach_dev(div4);
    			destroy_each(each_blocks, detaching);
    			if (each_1_else) each_1_else.d();
    			mounted = false;
    			dispose();
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("WelcomPage", slots, []);
    	let { launchGame } = $$props;
    	let game_ids = [];
    	let games = JSON.parse(localStorage.getItem("games"));
    	if (games) game_ids = Object.keys(games);
    	let game_list = game_ids.map(e => games[e]).sort((a, b) => b.update_date - a.update_date);
    	console.log(game_list);
    	const writable_props = ["launchGame"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<WelcomPage> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("launchGame" in $$props) $$invalidate(0, launchGame = $$props.launchGame);
    	};

    	$$self.$capture_state = () => ({
    		Game,
    		launchGame,
    		game_ids,
    		games,
    		game_list
    	});

    	$$self.$inject_state = $$props => {
    		if ("launchGame" in $$props) $$invalidate(0, launchGame = $$props.launchGame);
    		if ("game_ids" in $$props) game_ids = $$props.game_ids;
    		if ("games" in $$props) games = $$props.games;
    		if ("game_list" in $$props) $$invalidate(1, game_list = $$props.game_list);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [launchGame, game_list];
    }

    class WelcomPage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init$1(this, options, instance$1, create_fragment$1, safe_not_equal, { launchGame: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "WelcomPage",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*launchGame*/ ctx[0] === undefined && !("launchGame" in props)) {
    			console_1.warn("<WelcomPage> was created without expected prop 'launchGame'");
    		}
    	}

    	get launchGame() {
    		throw new Error("<WelcomPage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set launchGame(value) {
    		throw new Error("<WelcomPage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src\App.svelte generated by Svelte v3.38.2 */
    const file = "src\\App.svelte";

    // (25:0) {:else}
    function create_else_block(ctx) {
    	let div3;
    	let div1;
    	let div0;
    	let t0;
    	let img;
    	let img_src_value;
    	let t1;
    	let div2;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block_1, create_if_block_2];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*page*/ ctx[0] === "welcom") return 0;
    		if (/*page*/ ctx[0] === "game") return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type_1(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = space();
    			img = element("img");
    			t1 = space();
    			div2 = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div0, "class", "navigation-toggle svelte-1z0j9ee");
    			add_location(div0, file, 27, 8, 584);
    			if (img.src !== (img_src_value = "../images/molangeur-h_2.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-1z0j9ee");
    			add_location(img, file, 30, 8, 655);
    			attr_dev(div1, "class", "header-navigation svelte-1z0j9ee");
    			add_location(div1, file, 26, 4, 543);
    			attr_dev(div2, "class", "content svelte-1z0j9ee");
    			add_location(div2, file, 34, 4, 776);
    			attr_dev(div3, "class", "container svelte-1z0j9ee");
    			add_location(div3, file, 25, 0, 514);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div1);
    			append_dev(div1, div0);
    			append_dev(div1, t0);
    			append_dev(div1, img);
    			append_dev(div3, t1);
    			append_dev(div3, div2);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(div2, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(img, "click", /*click_handler*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(div2, null);
    				} else {
    					if_block = null;
    				}
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
    			if (detaching) detach_dev(div3);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d();
    			}

    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(25:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (18:0) {#if !app_ready}
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
    			add_location(p0, file, 20, 12, 385);
    			add_location(p1, file, 21, 12, 428);
    			attr_dev(div0, "class", "svelte-1z0j9ee");
    			add_location(div0, file, 19, 8, 366);
    			attr_dev(div1, "class", "loading svelte-1z0j9ee");
    			add_location(div1, file, 18, 5, 335);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, p0);
    			append_dev(div0, t1);
    			append_dev(div0, p1);
    		},
    		p: noop,
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
    		source: "(18:0) {#if !app_ready}",
    		ctx
    	});

    	return block;
    }

    // (41:35) 
    function create_if_block_2(ctx) {
    	let gamepage;
    	let current;

    	gamepage = new GamePage({
    			props: { id: /*game_id*/ ctx[1] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(gamepage.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(gamepage, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const gamepage_changes = {};
    			if (dirty & /*game_id*/ 2) gamepage_changes.id = /*game_id*/ ctx[1];
    			gamepage.$set(gamepage_changes);
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
    			destroy_component(gamepage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(41:35) ",
    		ctx
    	});

    	return block;
    }

    // (36:8) {#if page === "welcom"}
    function create_if_block_1(ctx) {
    	let welcompage;
    	let current;

    	welcompage = new WelcomPage({
    			props: { launchGame: /*func*/ ctx[4] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(welcompage.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(welcompage, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const welcompage_changes = {};
    			if (dirty & /*page, game_id*/ 3) welcompage_changes.launchGame = /*func*/ ctx[4];
    			welcompage.$set(welcompage_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(welcompage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(welcompage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(welcompage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(36:8) {#if page === \\\"welcom\\\"}",
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
    		if (!/*app_ready*/ ctx[2]) return 0;
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

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
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
    	let page = "welcom";
    	let game_id = null;
    	let app_ready = false;

    	initDictionnary(() => {
    		$$invalidate(2, app_ready = true);
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		$$invalidate(0, page = "welcom");
    	};

    	const func = id => {
    		$$invalidate(0, page = "game");
    		$$invalidate(1, game_id = id);
    	};

    	$$self.$capture_state = () => ({
    		GamePage,
    		WelcomPage,
    		initDictionnary,
    		page,
    		game_id,
    		app_ready
    	});

    	$$self.$inject_state = $$props => {
    		if ("page" in $$props) $$invalidate(0, page = $$props.page);
    		if ("game_id" in $$props) $$invalidate(1, game_id = $$props.game_id);
    		if ("app_ready" in $$props) $$invalidate(2, app_ready = $$props.app_ready);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [page, game_id, app_ready, click_handler, func];
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

    console.log("HELLO");

    return app;

}());
//# sourceMappingURL=bundle.js.map
