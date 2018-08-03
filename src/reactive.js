function Reactive(data, chunk)
{
	var reactive = (this instanceof Reactive) ? this : {
		pointer : -1,
		size: chunk,
		data_all: data
	};
		
	reactive.updateButton = document.querySelector('.update');
	reactive.updateClickStream = Rx.Observable.fromEvent(updateButton, 'click');

	reactive.requestStream = reactive.updateClickStream.startWith('startup click')
		.flatMap(function(){
			reactive.pointer++;
			return reactive.pointer;
		});

	reactive.responseStream = reactive.requestStream
		.flatMap(function(p){
			return reactive.data_all.slice(p*reactive.size, (p+1)*reactive.size);
		});

	reactive.responseStream.subscribe(function(d){
		reactive.data_chunk = d;
		reactive.sum += reactive.data_chunk.reduce(function(x,y){
			return x+y;
		})
	});

	return reactive;
}
