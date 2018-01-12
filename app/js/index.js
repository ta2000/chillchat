class Manager {
  constructor(sync) {
    this.sync = sync;
  }
  // Create or load a new resource
  request(name, meta) {
    return new Resource(this, name, meta).load();
  }
  // Loads all copies from all syncs
  load(resource) {
    return Promise.all(this.sync.map(function(sync) {
      return sync.load(resource);
    }));
  }
  // Updates all syncs
  update(resource, value) {
    if (typeof value === 'undefined') {
      throw new Error('update requires value');
    }
    return Promise.all(this.sync.map(function(sync) {
      return sync.update(resource, value);
    }));
  }
}
class Resource {
  constructor(manager, name, meta) {
    this.manager = manager;
    this.name = name;
    this.meta = meta;
    this.values = [];
    this.value = undefined;
  }
  load() {
    return this.manager.load(this).then(function(values) {
      this.values = values;
      for (var value of this.values) {
        if (value !== null) {
          this.value = value;
        }
      }
      return this;
    }.bind(this)).catch(this.error);
  }
  update(value) {
    return new Promise(function(resolve, reject) {
      this.manager.update(this, value).then(function() {
        this.value = value;
        resolve(this);
      }.bind(this)).catch(reject);
    }.bind(this));
  }
}
class Sync {
  // pre and post can be used to encrypt and decrypt data
  constructor(pre, post) {
    this.pre = pre;
    this.post = post;
  }
  load(resource) {
    return new Promise(function(resolve, reject) {
      this.get(resource).then(function(retrived) {
        var i = 0;
        var curr = retrived;
        var inc = function() {
          this.post[i](resource, curr).then(function(processed) {
            curr = processed;
            ++i;
            if (i < this.post.length) {
              inc();
            } else {
              resolve(curr);
            }
          }.bind(this));
        }.bind(this)
        inc();
      }.bind(this));
    }.bind(this));
  }
  update(resource, value) {
    return new Promise(function(resolve, reject) {
      var i = 0;
      var curr = value;
      var inc = function() {
        this.pre[i](resource, curr).then(function(processed) {
          curr = processed;
          ++i;
          if (i < this.post.length) {
            inc();
          } else {
            this.set(resource, curr).then(function() {
              resolve(resource);
            });
          }
        }.bind(this));
      }.bind(this)
      inc();
    }.bind(this));
  }
  get(resource) {}
  set(resource, preprocessed) {}
}
class LocalStorageSync extends Sync {
  get(resource) {
    return Promise.resolve(localStorage.getItem(resource.name));
  }
  set(resource, preprocessed) {
    return Promise.resolve(localStorage.setItem(resource.name,
      preprocessed));
  }
}
class JSONProcessor {
  pre(resource, value) {
    return Promise.resolve(JSON.stringify(value));
  }
  post(resource, value) {
    return Promise.resolve(JSON.parse(value));
  }
}
class Base64Processor {
  pre(resource, value) {
    return Promise.resolve(btoa(value));
  }
  post(resource, value) {
    if (typeof value !== 'string') {
      return Promise.resolve(value);
    }
    return Promise.resolve(atob(value));
  }
}

window.addEventListener('load', function() {
  var jsonp = new JSONProcessor();
  var base64 = new Base64Processor();
  var m = new Manager([new LocalStorageSync(
    [jsonp.pre, base64.pre], [base64.post, jsonp.post])]);
  m.request('test', {'meta': 'data'}).then(function(resource) {
    console.log('Load resource', resource.name, ':', resource.value);
    resource.update((new Date()).toString()).then(function(resource) {
      console.log('Updated resource', resource.name, ':', resource.value);
    });
  });
  // add button dynamically
  var buttonEl = document.createElement('button');
  buttonEl.className = 'mui-btn mui-btn--primary mui-btn--raised';
  buttonEl.innerHTML = 'My dynamic button';
  document.body.appendChild(buttonEl);
});

function activateModal() {
  // initialize modal element
  var modalEl = document.createElement('div');
  modalEl.style.width = '400px';
  modalEl.style.height = '300px';
  modalEl.style.margin = '100px auto';
  modalEl.style.backgroundColor = '#fff';

  // show modal
  mui.overlay('on', modalEl);
}
