class Products extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            payload: null,
            Id: 0,
            Quantity: 0,
            CategoryID: '',
            Name: '',
            Code: '',
            Price: 0,
            isOpen: false,
            isOpenCreate: false,
            singleData: null,
            index: 1,
            currentPage: 1,
            categoriesPerPage: 10,
            Categories: null,
            address: 'http://ec2-54-175-236-127.compute-1.amazonaws.com'
        };
    }

    componentDidMount() {
        fetch(`${this.state.address}/api/Category/`)
            .then((response) => response.json())
            .then((json) => {
                this.setState({
                    Categories: json
                })
            });
        this.refreshList();
    }

    componentDidUpdate() {
        this.refreshList();
    }

    refreshList() {
        fetch(`${this.state.address}/api/Product/`)
            .then(response => response.json())
            .then(json => {
                this.setState({
                    payload: json,
                    loading: false
                })
            })
    }


    deleteProduct(prodid) {
        if (window.confirm('Are you sure?')) {
            fetch(`${this.state.address}/api/Product/` + prodid, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            })
        }
    }

    editModal = (item, index) => {
        this.setState({
            singleData: item,
            isOpen: true,
            index: index
        });
    }

    closeModalHandler = () => {
        this.setState({
            isOpen: false
        });
    }
    closeModalHandlerCreate = () => {
        this.setState({
            isOpenCreate: false
        });
    }
    openModalHandlerCreate = () => {
        this.setState({
            isOpenCreate: true
        });
    }


    paginate = pageNumber => this.setState({ currentPage: pageNumber });

    render() {
        if (this.state.loading) return <div>Loading</div>

        let indexOfLastPost = this.state.currentPage * this.state.categoriesPerPage;
        let infexOfFirstPost = indexOfLastPost - this.state.categoriesPerPage;
        let currentPosts = this.state.payload.slice(infexOfFirstPost, indexOfLastPost);
        let categories = this.state.Categories;

        return (
            <div>
                <table className="table">
                    <thead>
                        <tr>
                            <th>Category</th>
                            <th>Name</th>
                            <th>Quantity</th>
                            <th>Price</th>
                            <th>Description</th>
                            <th>Options</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentPosts && currentPosts.map((item, index) => (

                            <tr style={{ margin: 5, fontFamily: 'Arial' }} key={item.id}>
                                <td> {categories && categories.find(o => o.CategoryID == item.CategoryID).categoryName} </td>
                                <td> {item.name} </td>
                                <td> {item.quantity} </td>
                                <td> {item.price} </td>
                                <td> {item.description} </td>
                                <td> <button className="btn btn-default" onClick={() => this.editModal(item, index)} style={{ marginRight: 10 }}>Edit</button>
                                    <button className="btn btn-danger" onClick={() => this.deleteProduct(item.id)}>Delete</button> </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {this.state.isOpen ? <Modal index={this.state.index} handleSetPayload={(payload) => this.handleSetPayload(payload)} payload={this.state.payload} data={this.state.singleData} show={this.state.isOpen} close={this.closeModalHandler} /> : null}
                {this.state.isOpenCreate ? <CreateModal refreshMe={() => this.refreshList()} handleSetPayload={(payload) => this.handleSetPayload(payload)} payload={this.state.payload} show={this.state.isOpenCreate} close={this.closeModalHandlerCreate} /> : null}

                <Pagination
                    categoriesPerPage={this.state.categoriesPerPage}
                    totalPosts={this.state.payload.length}
                    paginate={this.paginate}
                />
                <button className="open-modal-btn" onClick={this.openModalHandlerCreate}>Create Product</button>


            </div>
        )
    }
};


class Pagination extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const pageNumbers = [];
        for (let i = 1; i <= Math.ceil(this.props.totalPosts / this.props.categoriesPerPage); i++) {
            pageNumbers.push(i);
        }
        return (
            <nav>
                <ul className='pagination'>
                    {pageNumbers.map(number => (
                        <li key={number} className='page-item'>
                            <a onClick={() => this.props.paginate(number)} className='page-link'>
                                {number}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>
        )
    }
}

//EDIT PRODUCT
class Modal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            id: this.props.data.id,
            categoryID: this.props.data.categoryID,
            name: this.props.data.name,
            description: this.props.data.description,
            price: this.props.data.price,
            quantity: this.props.data.quantity,
            index: this.props.index,
            address: 'https://ec2-54-175-236-127.compute-1.amazonaws.com'
        };
    }

    handleSubmit = () => {
        const data = JSON.stringify({
            id: this.state.id,
            categoryID: this.state.categoryID,
            name: this.state.name,
            description: this.state.description,
            quantity:  parseInt(this.state.quantity),
            price: parseInt(this.state.price)
        });
        fetch(`${this.state.address}/api/Product/` + this.state.id, {
            headers: { "Content-Type": "application/json; charset=utf-8" },
            method: 'PUT',
            body: data
        }).then(response => response)
            .then(res => {
                console.log(res.status)
                if (res.status == 204) { //the default status of editing the info from table
                    let afterEdit = this.props.payload;
                    afterEdit[this.state.index].name = this.state.name;
                    afterEdit[this.state.index].categoryID = this.state.categoryID;
                    afterEdit[this.state.index].quantity = this.state.quantity;
                    afterEdit[this.state.index].price = this.state.price;
                    afterEdit[this.state.index].description = this.state.description;
                    this.props.handleSetPayload([...afterEdit])
                    this.props.close()
                }
            }).catch(err => {
            });
    }

    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    }
    render() {
        return (
            <div id="myModal" style={{ display: this.props.show ? 'block' : 'none' }} className="modal">
                <div className="modal-content">
                    <div className="modal-header">
                        <span className="close" onClick={this.props.close}>&times;</span>
                        <h2>Edit the product {this.state.name}  </h2>
                    </div>
                    <div className="modal-body">
                        <h5>  Name</h5>
                        <input name="name" type="text" onChange={this.handleChange} value={this.state.name} />
                        <h5> description</h5>
                        <input name="description" type="text" onChange={this.handleChange} value={this.state.description} />
                        <h5> price</h5>
                        <input name="price" type="number" onChange={this.handleChange} value={this.state.price} />
                        <h5> Quantity</h5>
                        <input name="quantity" type="number" onChange={this.handleChange} value={this.state.quantity} />
                    </div>
                    <div className="modal-footer">
                        <button onClick={this.props.close}>Cancel</button>
                        <button onClick={() => this.handleSubmit(this.state.id)}>Submit</button>
                    </div>
                </div>

            </div>
        )
    }
}




//ADD NEW PRODUCT TO THE LIST
class CreateModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            description: '',
            price: '',
            quantity: '',
            name: '',
            id: '',
            categoryID: '',
            categories: null,
            address: 'https://ec2-54-175-236-127.compute-1.amazonaws.com'
        };
    }

    handleSubmit = () => {
        const data = JSON.stringify({
            categoryID: parseInt(this.state.categoryID),
            name: this.state.name,
            quantity: parseInt(this.state.quantity),
            price: parseInt(this.state.price),
            description: this.state.description
        });

        fetch(`${this.state.address}/api/Product/`, {
            headers: { "Content-Type": "application/json; charset=utf-8" },
            method: 'POST',
            body: data
        }).then(response => response.json())
            .then(res => {
                this.props.refreshMe();
                this.props.close()
            });
    }
    handleChange = (event) => {
        this.setState({ [event.target.name]: event.target.value });
    }

    componentDidMount() {
        fetch(`${this.state.address}/api/Category/`)
            .then((response) => response.json())
            .then((json) => {
                this.setState({
                    categories: json,
                    categoryID: json[0].categoryID
                })
            })
    }
    render() {
        return (
            <div id="myModal" style={{ display: this.props.show ? 'block' : 'none' }} className="modal">
                <div className="modal-content">
                    <div className="modal-header">
                        <span className="close" onClick={this.props.close}>&times;</span>
                        <h2>Add a product </h2>
                    </div>
                    <div className="modal-body">
                        <h5> Product Name</h5>
                        <input name="name" type="text" onChange={this.handleChange} value={this.state.name} />
                        <h5> Description</h5>
                        <input name="description" type="text" onChange={this.handleChange} value={this.state.description} />
                        <h5> Price</h5>
                        <input name="price" type="number" onChange={this.handleChange} value={this.state.price} />
                        <h5> Quantity</h5>
                        <input name="quantity" type="number" onChange={this.handleChange} value={this.state.quantity} />
                        <h5> Category</h5>
                        <select onChange={(e) => this.setState({ categoryID: e.target.value })}>
                            {this.state.categories && this.state.categories.map((item) => (
                                <option key={item.categoryID} value={item.categoryID}>{item.categoryName}</option>
                            ))}
                        </select>

                    </div>
                    <div className="modal-footer">
                        <button onClick={this.props.close}>Cancel</button>
                        <button onClick={() => this.handleSubmit(this.state.id)}>Submit</button>
                    </div>
                </div>

            </div>
        )
    }
}



ReactDOM.render(
    <Products />,
    document.getElementById('ProductsTable')
);